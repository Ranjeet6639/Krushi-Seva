import { Router } from "express";
import { listCrop, getAllCrops, getFarmerCrops, deleteCrop } from "../controllers/cropController.js";

const router = Router();
router.post("/", listCrop);                          // farmer lists a crop
router.get("/", getAllCrops);                        // trader sees all active crops
router.get("/farmer/:farmerId", getFarmerCrops);    // farmer sees their own crops
router.delete("/:id", deleteCrop);                  // farmer deletes a crop

export default router;