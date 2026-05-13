import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  farmerName: { type: String },
  farmerMobile: { type: String },
  farmerAddress: { type: String },
  farmerVillage: { type: String },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: "Vegetable" },
  image: { type: String },
  status: { type: String, default: "Active" }
}, { timestamps: true });

export const Crop = mongoose.model("Crop", cropSchema);