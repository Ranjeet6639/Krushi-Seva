import { Router } from "express";
import admin from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  generateUniqueUserCode,
  buildUserResponse        // ← import this so we return ALL fields
} from "../controllers/authController.js";

const router = Router();

router.post("/social-login", async (req, res, next) => {
  try {
    const { firebaseToken, role } = req.body;

    if (!firebaseToken || !role) {
      return res.status(400).json({
        message: "Firebase token and role are required"
      });
    }

    // Verify the Firebase token
    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name, picture } = decoded;

    // Check if user already exists
    let user = await User.findOne({ email, role });

    if (!user) {
      // First time — create user automatically
      const userCode = await generateUniqueUserCode(role);

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        mobile: uid,           // use Firebase UID as unique placeholder
        passwordHash: uid,
        role,
        userCode,
        firebaseUid: uid,
        phoneVerifiedAt: new Date()
      });
    } else {
      // Existing user — update firebaseUid if not set yet
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    // Issue JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        userCode: user.userCode
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return ALL user fields — same as regular login
    res.json({
      message: "Login successful",
      token,
      user: buildUserResponse(user)    // ← now returns state, district, address, pincode, profile etc.
    });

  } catch (error) {
    console.error("Social login error:", error.message);
    next(error);
  }
});

export default router;