import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["farmer", "trader"],
      required: true,
    },

    userCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      trim: true,
    },

    dob: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    // false for accounts that only use social login (no password set yet)
    hasPassword: {
      type: Boolean,
      default: true,
    },

    // bump this number to log the user out everywhere (e.g. on password reset)
    tokenVersion: {
      type: Number,
      default: 0,
    },

    firebaseUid: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    phoneVerifiedAt: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpires: {
      type: Date,
    },

    profile: {
      ration: {
        type: String,
        trim: true,
      },

      fileName: {
        type: String,
        trim: true,
      },

      taluka: {
        type: String,
        trim: true,
      },

      village: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// indexes for lookups that had none (email and mobile are already unique)
userSchema.index({ firebaseUid: 1 });
userSchema.index({ resetPasswordToken: 1 });

export const User = mongoose.model("User", userSchema);