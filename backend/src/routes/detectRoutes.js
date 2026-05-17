import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure uploads folder exists when server starts
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, PNG, or WEBP images allowed"));
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  try {
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-001",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert agricultural scientist specializing in crop disease detection.

Analyze this crop or plant leaf image and respond ONLY in this exact JSON format with no extra text or markdown:
{
  "disease": "Name of the disease (or Healthy if no disease found)",
  "confidence": "High or Medium or Low",
  "solution": "Practical treatment steps in 2-3 sentences",
  "pesticide": "Recommended pesticide or fungicide name (or None needed if healthy)"
}

If the image is not a plant or leaf respond with:
{
  "disease": "Not a plant image",
  "confidence": "High",
  "solution": "Please upload a clear photo of a crop leaf or plant.",
  "pesticide": "None"
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    // Check for API-level errors
    if (data.error) {
      throw new Error(data.error.message || "OpenRouter API error");
    }

    const text = data.choices[0].message.content;

    // Strip markdown code fences if present
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    const parsed = JSON.parse(jsonMatch[0]);

    // Delete uploaded image after analysis
    fs.unlinkSync(req.file.path);

    res.json({
      disease: parsed.disease || "Unknown",
      confidence: parsed.confidence || "Low",
      solution: parsed.solution || "Please consult a local agricultural expert.",
      pesticide: parsed.pesticide || "None"
    });

  } catch (error) {
    console.error("Detect error:", error.message);

    // Clean up file if analysis failed
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      disease: "Detection Failed",
      solution: "Could not analyze the image. Please try again.",
      pesticide: "-"
    });
  }
});

export default router;