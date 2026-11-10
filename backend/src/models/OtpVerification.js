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
    // the email this OTP was delivered to. Registration must use the
    // same email, so the verified code can't be reused for a different account.
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    // this now holds a keyed hash (HMAC) of the OTP, never the OTP itself
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
    },
    // FIX 6: track wrong attempts to prevent brute-force
    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// OTP lookups are always by mobile + role (and email)
otpVerificationSchema.index({ mobile: 1, role: 1 });
otpVerificationSchema.index({ email: 1 });

export const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);