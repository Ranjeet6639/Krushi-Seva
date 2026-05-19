import { Router } from "express";
import admin from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateUniqueUserCode } from "../controllers/authController.js";


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
      mobile: "",
      passwordHash: uid,     // ← correct field name
      role,
      userCode,              // ← generate a userCode too
      firebaseUid: uid,
      phoneVerifiedAt: new Date()
    });
    }

    // Issue your own JWT same as regular login
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        userCode: user.userCode
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userCode: user.userCode,
        mobile: user.mobile
      }
    });

  } catch (error) {
    console.error("Social login error:", error.message);
    next(error);
  }
});

export default router;