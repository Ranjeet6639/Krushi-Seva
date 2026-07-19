import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, PNG, or WEBP images allowed"));
  }
});

const MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "google/gemma-4-26b-a4b-it:free"
];

const PROMPT = `You are an expert agricultural scientist specializing in crop disease detection.

Look closely at this specific image. First think through what you actually observe — leaf color, spot shape/size/color, pattern of damage, wilting, discoloration edges, powdery/fuzzy texture, insect presence, etc. Base your diagnosis ONLY on what is visibly present in THIS image, not on what disease is most common in general. Different images should get different answers if their symptoms differ.

After your visual observation, respond ONLY in this exact JSON format with no extra text or markdown:
{
  "observed": "1 short sentence describing the specific visible symptoms in this image",
  "disease": "Name of the disease (or Healthy if no disease found)",
  "confidence": "High or Medium or Low",
  "solution": "Practical treatment steps in 2-3 sentences",
  "pesticide": "Recommended pesticide or fungicide name (or None needed if healthy)"
}

If the image is not a plant or leaf respond with:
{
  "observed": "Not a plant image",
  "disease": "Not a plant image",
  "confidence": "High",
  "solution": "Please upload a clear photo of a crop leaf or plant.",
  "pesticide": "None"
}`;

async function callOpenRouter(model, base64Image, mimeType) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ]
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

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const base64Image = req.file.buffer.toString("base64");
  const mimeType = req.file.mimetype;

  let lastError;

  for (const model of MODELS) {
    try {
      const parsed = await callOpenRouter(model, base64Image, mimeType);
      console.log(`Detect [${model}] observed: ${parsed.observed} -> ${parsed.disease}`);

      return res.json({
        disease: parsed.disease || "Unknown",
        confidence: parsed.confidence || "Low",
        solution: parsed.solution || "Please consult a local agricultural expert.",
        pesticide: parsed.pesticide || "None"
      });
    } catch (error) {
      console.error(`Detect error [${model}]:`, error.message);
      lastError = error;
      // try next model
    }
  }

  console.error("Detect: all models failed. Last error:", lastError?.message);
  res.status(500).json({
    disease: "Detection Failed",
    solution: "Could not analyze the image. Please try again.",
    pesticide: "-"
  });
});

export default router;