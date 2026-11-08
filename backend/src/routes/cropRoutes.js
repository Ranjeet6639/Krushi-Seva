import { Router } from "express";

import { handleImageUpload } from "../config/cloudinary.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

import {
  listCrop,
  getAllCrops,
  getFarmerCrops,
  deleteCrop
} from "../controllers/cropController.js";

const router = Router();

/* Farmer lists crop with image */
router.post(
  "/",
  requireAuth,
  requireRole("farmer"),
  handleImageUpload("image"),
  listCrop
);

/* Trader sees all crops */
router.get(
  "/",
  requireAuth,
  requireRole("trader"),
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
  requireRole("farmer"),
  deleteCrop
);

export default router;
