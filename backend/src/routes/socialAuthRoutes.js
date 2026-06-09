import { Router } from "express";
import { auth } from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  generateUniqueUserCode,
  buildUserResponse
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

    // Verify Firebase ID Token
    const decoded = await auth.verifyIdToken(firebaseToken);

    const {
      uid,
      email,
      name,
      picture
    } = decoded;

    // Check if user already exists
    let user = await User.findOne({
      email,
      role
    });

    if (!user) {
      const userCode = await generateUniqueUserCode(role);

      user = await User.create({
        name: name || email?.split("@")[0] || "User",
        email,
        mobile: uid,
        passwordHash: uid,
        role,
        userCode,
        firebaseUid: uid,
        profileImage: picture || "",
        phoneVerifiedAt: new Date()
      });
    } else {
      let updated = false;

      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        updated = true;
      }

      if (picture && !user.profileImage) {
        user.profileImage = picture;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        userCode: user.userCode
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: buildUserResponse(user)
    });

  } catch (error) {
    console.error("Social login error:", error);
    next(error);
  }
});

export default router;