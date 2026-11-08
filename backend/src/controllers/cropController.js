import mongoose from "mongoose";
import { Crop } from "../models/Crop.js";
import { User } from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const CATEGORIES = ["Vegetable", "Fruit", "Grains", "Pulses"];

/*
  BATCH A: contact details are NOT sent to everyone browsing the market.
  Traders get the farmer's mobile + address only after the farmer accepts
  their offer (see GET /api/offers/trader).
*/
const PUBLIC_CROP_SELECT = "-farmerMobile -farmerAddress";

export async function listCrop(req, res, next) {
  try {
    // only farmers can list crops
    if (req.user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can list crops" });
    }

    // only these 4 fields are read from the request.
    // Before, the whole req.body was saved, so anyone could set farmerId etc.
    const name = String(req.body.name || "").trim();
    const quantity = Number(req.body.quantity);
    const price = Number(req.body.price);
    const category = req.body.category || "Vegetable";

    if (!name || name.length > 80) {
      return res.status(400).json({ message: "Crop name is required (max 80 characters)" });
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000000) {
      return res.status(400).json({ message: "Quantity must be a number greater than 0" });
    }
    if (!Number.isFinite(price) || price <= 0 || price > 100000) {
      return res.status(400).json({ message: "Price must be a number greater than 0" });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid crop category" });
    }

    // farmer identity + contact come from the database, not the browser
    const farmer = await User.findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ message: "User not found" });
    }

    const farmerId = farmer.userCode || req.user.userCode;
    if (!farmerId) {
      return res.status(400).json({ message: "Your account has no farmer ID. Please log in again." });
    }

    let imageUrl = "";

    // If a file was uploaded, send it to Cloudinary (after validation passes)
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url; // permanent Cloudinary URL
    }

    const crop = await Crop.create({
      farmerId,
      farmerName: farmer.name,
      farmerMobile: farmer.mobile,
      farmerAddress: farmer.address || "",
      farmerVillage: farmer.profile?.village || "",
      name,
      quantity,
      price,
      category,
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

// route now requires login + trader role (see cropRoutes.js)
export async function getAllCrops(req, res, next) {
  try {
    const crops = await Crop.find({
      status: "Active"
    })
      .select(PUBLIC_CROP_SELECT)
      .sort({ createdAt: -1 });

    res.json({ crops });

  } catch (err) {
    next(err);
  }
}

export async function getFarmerCrops(req, res, next) {
  try {
    // a farmer can only read their OWN crops
    if (req.user.role !== "farmer" || req.params.farmerId !== req.user.userCode) {
      return res.status(403).json({
        message: "You can only view your own crops"
      });
    }

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
    //  bad ids now return 400 instead of crashing with a 500
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid crop id" });
    }

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
