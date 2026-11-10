import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  // Trader info
  traderId:      { type: String, required: true },
  traderName:    { type: String, required: true },
  traderMobile:  { type: String, required: true },
  traderEmail:   { type: String },
  traderAddress: { type: String },
  traderCode:    { type: String },

  // Crop info
  cropId:        { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
  cropName:      { type: String, required: true },
  farmerId:      { type: String, required: true },
  farmerName:    { type: String },

  // Offer details
  offerPrice:    { type: Number, required: true },
  quantity:      { type: Number, required: true },
  message:       { type: String, default: "" },

  // Status
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

// indexes for the queries the app actually runs
offerSchema.index({ farmerId: 1, createdAt: -1 });  // offers received by a farmer
offerSchema.index({ traderId: 1, createdAt: -1 });  // offers sent by a trader
offerSchema.index({ cropId: 1, status: 1 });        // offers on one crop (sold out / crop deleted)

export const Offer = mongoose.model("Offer", offerSchema);