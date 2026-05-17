import { Crop } from "../models/Crop.js";

export async function listCrop(req, res, next) {
  try {
    const crop = await Crop.create({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    res.status(201).json({
      message: "Crop listed successfully",
      crop
    });

  } catch (err) {
    next(err);
  }
}

export async function getAllCrops(req, res, next) {
  try {
    const crops = await Crop.find({
      status: "Active"
    }).sort({ createdAt: -1 });

    res.json({ crops });

  } catch (err) {
    next(err);
  }
}

export async function getFarmerCrops(req, res, next) {
  try {
    const crops = await Crop.find({
      farmerId: req.params.farmerId
    }).sort({ createdAt: -1 });

    res.json({ crops });

  } catch (err) {
    next(err);
  }
}

export async function deleteCrop(req, res, next) {
  try {
    // Step 1: Find the crop first (don't delete blindly)
    const crop = await Crop.findById(req.params.id);

    // Step 2: If crop doesn't exist, return 404
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    // Step 3: Check that the logged-in farmer owns this crop
    // req.user.userCode is attached by requireAuth middleware
    if (crop.farmerId !== req.user.userCode) {
      return res.status(403).json({
        message: "You are not authorized to delete this crop"
      });
    }

    // Step 4: Safe to delete now
    await crop.deleteOne();

    res.json({ message: "Crop deleted" });

  } catch (err) {
    next(err);
  }
}