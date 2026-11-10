import { Router } from "express";

import { handleImageUpload } from "../config/cloudinary.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { cropSchema } from "../validators/schemas.js";

import {
  listCrop,
  getAllCrops,
  getFarmerCrops,
  deleteCrop
} from "../controllers/cropController.js";

const router = Router();

/* Farmer lists crop with image (BATCH A: farmer role + upload limits) */
router.post(
  "/",
  requireAuth,
  requireRole("farmer"),
  handleImageUpload("image"),
  validate(cropSchema), // BATCH B: runs after multer has read the form fields
  listCrop
);

/* Trader sees all crops (BATCH A: was public, now login + trader only) */
router.get(
  "/",
  requireAuth,
  requireRole("trader"),
  getAllCrops
);

/* Farmer sees own crops (BATCH A: ownership checked in controller) */
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
