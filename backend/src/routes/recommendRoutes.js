import { Router } from "express";

const router = Router();

// Fallback chain: tries each model in order until one works
const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "google/gemma-4-26b-a4b-it:free",
];

async function callOpenRouter(model, prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // 30s timeout per model

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 2500, // enough room for reasoning + JSON answer
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      throw new Error(`OpenRouter ${response.status} (${model}): ${raw.slice(0, 200)}`);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Non-JSON response from ${model}: ${raw.slice(0, 200)}`);
    }

    if (data.error) {
      throw new Error(data.error.message || `OpenRouter error (${model})`);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error(`Empty response from ${model}`);

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in response from ${model}: ${cleaned.slice(0, 200)}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.result && !(parsed.crops && parsed.crops.length)) {
      throw new Error(`Invalid JSON shape from ${model}`);
    }
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

// Used only if every AI model fails, so the demo never shows an error
function buildFallback({ soil, season, previousCrop }) {
  const s = (soil || "").toLowerCase();
  const prev = (previousCrop || "").toLowerCase();

  let crops;
  if (s.includes("black")) crops = ["Soybean", "Tur (Pigeon Pea)", "Cotton"];
  else if (s.includes("red")) crops = ["Groundnut", "Bajra", "Ragi"];
  else if (s.includes("alluvial")) crops = ["Rice", "Wheat", "Sugarcane"];
  else crops = ["Soybean", "Gram (Chickpea)", "Maize"];

  // Crop rotation: avoid repeating the previous crop
  crops = crops.filter((c) => !prev || !c.toLowerCase().includes(prev));
  crops = crops.slice(0, 3);

  return {
    result: `Based on your ${soil || "soil"} and ${season || "current"} season, ${crops.join(", ")} are good choices. Rotating away from ${previousCrop || "your previous crop"} also helps soil health and reduces pests.`,
    crops,
    tips: "Test your soil before sowing and use certified seeds for better yield.",
  };
}

router.post("/", async (req, res) => {
  const { formData } = req.body;

  if (!formData) {
    return res.status(400).json({ message: "formData is required" });
  }

  const { location, season, soil, irrigation, water, previousCrop, preference, budget } = formData;

  const prompt = `You are an expert agricultural advisor for Indian farmers.

A farmer has provided these details:
- Location: ${location}
- Season: ${season}
- Soil Type: ${soil}
- Has Irrigation: ${irrigation}
- Water Availability: ${water}
- Previous Crop grown: ${previousCrop}
- Crop Preference: ${preference}
- Budget: ${budget}

Recommend the best 3 crops to grow. Respond ONLY in this exact JSON format with no extra text or markdown:
{
  "result": "A helpful 2-3 sentence recommendation explaining which crops to grow and why, written simply so a farmer can understand.",
  "crops": ["Crop 1", "Crop 2", "Crop 3"],
  "tips": "One practical farming tip for this season and soil type."
}`;

  let lastError;

  for (const model of MODELS) {
    try {
      const parsed = await callOpenRouter(model, prompt);
      console.log(`✅ Recommendation served by ${model}`);
      return res.json({
        result: parsed.result || "Could not generate recommendation.",
        crops: Array.isArray(parsed.crops) ? parsed.crops : [],
        tips: parsed.tips || "",
      });
    } catch (error) {
      console.error(`❌ Recommend error [${model}]:`, error.message);
      lastError = error;
    }
  }

  // Every model failed: return a rule-based answer instead of an error
  console.error("Recommend: all models failed. Last error:", lastError?.message);
  return res.json(buildFallback(formData));
});

export default router;