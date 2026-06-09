import { Router } from "express";

import { upload } from "../config/cloudinary.js";
import { requireAuth } from "../middleware/requireAuth.js";

import {
  listCrop,
  getAllCrops,
  getFarmerCrops,
  deleteCrop
} from "../controllers/cropController.js";

const router = Router();

/* Farmer lists crop with image */
router.post("/", requireAuth, upload.single("image"), listCrop);

/* Trader sees all crops */
router.get(
  "/",
  getAllCrops
);

/* Farmer sees own crops */
router.get(
  "/farmer/:farmerId",
  requireAuth,
  getFarmerCrops
);

/* Delete crop */
router.delete(
  "/:id",
  requireAuth,
  deleteCrop
);

export default router;