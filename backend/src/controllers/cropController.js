import { Crop } from "../models/Crop.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export async function listCrop(req, res, next) {
  try {
    let imageUrl = "";

    // If a file was uploaded, send it to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url; // permanent Cloudinary URL
    }

    const crop = await Crop.create({
      ...req.body,
      image: imageUrl
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
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    if (crop.farmerId !== req.user.userCode) {
      return res.status(403).json({
        message: "You are not authorized to delete this crop"
      });
    }

    await crop.deleteOne();

    res.json({ message: "Crop deleted" });

  } catch (err) {
    next(err);
  }
}