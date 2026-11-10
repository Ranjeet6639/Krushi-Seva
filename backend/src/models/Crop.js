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

// indexes for the queries the app actually runs
cropSchema.index({ farmerId: 1, createdAt: -1 });   // farmer's own crops
cropSchema.index({ status: 1, createdAt: -1 });     // market list (Active crops, newest first)

export const Crop = mongoose.model("Crop", cropSchema);