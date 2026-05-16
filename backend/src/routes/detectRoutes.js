import { Router } from "express";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPG/PNG/WEBP allowed"));
  }
});

// Stub — replace with your actual ML model integration
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  // TODO: Replace this with real model call e.g. Python microservice or TensorFlow
  res.json({
    disease: "Leaf Blight",
    solution: "Remove infected leaves. Apply copper-based fungicide every 7 days.",
    pesticide: "Blitox 50 WP (Copper Oxychloride)"
  });
});

export default router;