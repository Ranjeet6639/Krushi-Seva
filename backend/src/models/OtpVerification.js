import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["farmer", "trader"],
      required: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    otp: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true
    },
    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);
