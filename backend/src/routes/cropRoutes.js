import { Router } from "express";

import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/requireAuth.js";

import {
  listCrop,
  getAllCrops,
  getFarmerCrops,
  deleteCrop
} from "../controllers/cropController.js";

const router = Router();

const storage = multer.diskStorage({

  destination: function (_req, _file, cb) {

  cb(
    null,
    path.join(process.cwd(), "uploads")
  );

  },

  filename: function (_req, file, cb) {

    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );

  }

});

const upload = multer({ storage });

/* Farmer lists crop with image */
router.post(
  "/",
  upload.single("image"),
  requireAuth,
  listCrop
);

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