import { Router } from "express";

import multer from "multer";
import path from "path";

import {
  listCrop,
  getAllCrops,
  getFarmerCrops,
  deleteCrop
} from "../controllers/cropController.js";

const router = Router();

const storage = multer.diskStorage({

  destination: function (_req, _file, cb) {

    cb(null, "uploads/");

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
  getFarmerCrops
);

/* Delete crop */
router.delete(
  "/:id",
  deleteCrop
);

export default router;