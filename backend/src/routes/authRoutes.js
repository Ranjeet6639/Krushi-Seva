import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  sendOtp,
  verifyOtp
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import {
  forgotPasswordLimiter,
  loginAccountLimiter,
  loginIpLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  registerLimiter,
  resetPasswordLimiter
} from "../middleware/rateLimiters.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema
} from "../validators/schemas.js";

const router = Router();

// every route now has a rate limit and a validation schema
router.post("/otp/send", otpSendLimiter, validate(sendOtpSchema), sendOtp);
router.post("/otp/verify", otpVerifyLimiter, validate(verifyOtpSchema), verifyOtp);
router.post("/register", registerLimiter, validate(registerSchema), registerUser);
router.post("/login", loginIpLimiter, validate(loginSchema), loginAccountLimiter, loginUser);
router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
