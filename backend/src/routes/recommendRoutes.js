import { Router } from "express";

const router = Router();
const MODELS = [
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-20b:free"
];

async function callOpenRouter(model, prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 800, 
      messages: [{ role: "user", content: prompt }]
    })
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
  if (!jsonMatch) throw new Error(`No JSON found in response from ${model}: ${cleaned.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
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
      return res.json({
        result: parsed.result || "Could not generate recommendation.",
        crops: parsed.crops || [],
        tips: parsed.tips || ""
      });
    } catch (error) {
      console.error(`Recommend error [${model}]:`, error.message);
      lastError = error;
    }
  }

  console.error("Recommend: all models failed. Last error:", lastError?.message);
  res.status(500).json({
    message: "Error getting recommendation. Please try again."
  });
});

export default router;