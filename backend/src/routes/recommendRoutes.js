import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  const { formData } = req.body;

  if (!formData) {
    return res.status(400).json({ message: "formData is required" });
  }

  const { location, season, soil, irrigation, water, previousCrop, preference, budget } = formData;

  try {
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
            content: `You are an expert agricultural advisor for Indian farmers.

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
}`
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

    res.json({
      result: parsed.result || "Could not generate recommendation.",
      crops: parsed.crops || [],
      tips: parsed.tips || ""
    });

  } catch (error) {
    console.error("Recommend error:", error.message);
    res.status(500).json({
      message: "Error getting recommendation. Please try again."
    });
  }
});

export default router;