import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  sendOtp,
  verifyOtp
} from "../controllers/authController.js";

const router = Router();

router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
