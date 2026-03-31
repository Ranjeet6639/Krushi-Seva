import { Router } from "express";
import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtp
} from "../controllers/authController.js";

const router = Router();

router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
