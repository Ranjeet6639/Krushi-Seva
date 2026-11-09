import { Router } from "express";
import { User } from "../models/User.js";
import { OtpVerification } from "../models/OtpVerification.js";
import { isRealMobile, normalizeMobile } from "../utils/userHelpers.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { buildUserResponse } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../validators/schemas.js";

const router = Router();

// GET /api/user/me — fetch fresh profile from DB
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/user/profile — update profile fields
// body is validated and cleaned by profileSchema
router.patch("/profile", requireAuth, validate(profileSchema), async (req, res, next) => {
  try {
    const {
      name, gender, dob, mobile,
      state, district, address, pincode,
      village, taluka, ration
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    /*
      changing the mobile number needs a verified OTP for the NEW number,
      the number must be valid, and it must not belong to another account.
      Everything is checked BEFORE anything is changed.
    */
    let newMobile = null;

    if (mobile) {
      const normalized = normalizeMobile(mobile);

      if (normalized !== user.mobile) {
        if (!isRealMobile(normalized)) {
          // Old social accounts may send their stored placeholder back unchanged: ignore that.
          if (String(mobile).trim() !== user.mobile) {
            return res.status(400).json({ message: "Enter a valid mobile number" });
          }
        } else {
          const taken = await User.findOne({ mobile: normalized, _id: { $ne: user._id } });
          if (taken) {
            return res.status(409).json({ message: "This mobile number is already registered" });
          }

          const verified = await OtpVerification.findOne({
            mobile: normalized,
            role: user.role,
            email: user.email,
            verified: true,
            expiresAt: { $gt: new Date() }
          });

          if (!verified) {
            return res.status(403).json({
              message: "Please verify the new mobile number with an OTP before saving."
            });
          }

          newMobile = normalized;
        }
      }
    }

    // Update only fields that were sent
    if (name)     user.name     = name.trim();
    if (gender)   user.gender   = gender;
    if (dob)      user.dob      = dob;
    if (newMobile) {
      user.mobile = newMobile;
      user.phoneVerifiedAt = new Date();
    }
    if (state)    user.state    = state.trim();
    if (district) user.district = district.trim();
    if (address)  user.address  = address.trim();
    if (pincode)  user.pincode  = pincode.trim();

    // Farmer-specific profile fields
    if (user.role === "farmer") {
      user.profile = {
        ...user.profile,
        village: village || user.profile?.village || "",
        taluka:  taluka  || user.profile?.taluka  || "",
        ration:  ration  || user.profile?.ration  || ""
      };
    }

    await user.save();

    // the OTP can only be used once
    if (newMobile) {
      await OtpVerification.deleteMany({ mobile: newMobile, role: user.role });
    }

    // Return updated user — also update localStorage on frontend
    res.json({
      message: "Profile updated successfully",
      user: buildUserResponse(user)
    });

  } catch (err) {
    next(err);
  }
});

export default router;