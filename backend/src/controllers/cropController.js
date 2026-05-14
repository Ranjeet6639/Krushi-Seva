import { Crop } from "../models/Crop.js";

export async function listCrop(req, res, next) {
  try {

    const crop = await Crop.create({
      ...req.body,

      image: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : ""
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

    await Crop.findByIdAndDelete(req.params.id);

    res.json({
      message: "Crop deleted"
    });

  } catch (err) {
    next(err);
  }
}