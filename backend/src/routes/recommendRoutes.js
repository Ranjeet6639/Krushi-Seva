import { Router } from "express";

const router = Router();

// Stub — replace with OpenAI / Gemini API call
router.post("/", (req, res) => {
  const { formData } = req.body;

  if (!formData) {
    return res.status(400).json({ message: "formData is required" });
  }

  const { season, soil, water, budget } = formData;

  // Simple rule-based stub until you integrate an AI API
  let crops = [];

  if (season === "Kharif" && soil === "Black") crops = ["Soybean", "Cotton", "Jowar"];
  else if (season === "Rabi" && soil === "Loamy") crops = ["Wheat", "Gram", "Mustard"];
  else if (season === "Summer") crops = ["Sunflower", "Groundnut", "Moong Dal"];
  else crops = ["Bajra", "Maize", "Tur Dal"];

  const result = `Based on your inputs (${season} season, ${soil} soil, ${water} water, ${budget} budget), we recommend: ${crops.join(", ")}.`;

  res.json({ result });
});

export default router;