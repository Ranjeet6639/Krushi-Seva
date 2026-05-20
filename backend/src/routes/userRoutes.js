import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { buildUserResponse } from "../controllers/authController.js";

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
router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const {
      name, gender, dob, mobile,
      state, district, address, pincode,
      village, taluka, ration
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update only fields that were sent
    if (name)     user.name     = name.trim();
    if (gender)   user.gender   = gender;
    if (dob)      user.dob      = dob;
    if (mobile)   user.mobile   = mobile.trim();
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