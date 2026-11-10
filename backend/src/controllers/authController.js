import { logger } from "../utils/logger.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OtpVerification } from "../models/OtpVerification.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { escapeHtml } from "../utils/html.js";
import {
  isRealMobile,
  isSocialOnly,
  normalizeMobile
} from "../utils/userHelpers.js";

// after the OTP is verified, registration/profile save must happen within this time
const VERIFIED_WINDOW_MINUTES = 30;

// OTPs are stored as an HMAC hash, so a database leak doesn't expose live codes
function hashOtp(mobile, role, otp) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  return crypto
    .createHmac("sha256", secret)
    .update(`${mobile}:${role}:${otp}`)
    .digest("hex");
}

function otpMatches(storedHash, mobile, role, otp) {
  const a = Buffer.from(String(storedHash || ""), "utf8");
  const b = Buffer.from(hashOtp(mobile, role, otp), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// crypto.randomInt instead of Math.random() (which is predictable)
function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/*
  DEMO OTP MODE
  When ALLOW_DEV_OTP=true (in .env locally, or in Render's Environment tab),
  the OTP is shown on the page instead of being sent anywhere.
  This is for demos only: anyone can then register with any mobile number.
  Remove the variable (or set it to false) before real users sign up.
  Without it, the OTP is emailed and never returned in the response.
*/
function isDevOtpAllowed() {
  return process.env.ALLOW_DEV_OTP === "true";
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

const OTP_RESEND_COOLDOWN_SECONDS = 60;

// exported so social login uses the exact same token.
// "ver" lets us cancel every old token by bumping user.tokenVersion.
export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      userCode: user.userCode,
      ver: user.tokenVersion || 0
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
}

function getOtpExpiryDate() {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

function buildProfilePayload(role, body) {
  if (role === "farmer") {
    return {
      ration: body.ration || "",
      fileName: body.fileName || "",
      taluka: body.taluka || "",
      village: body.village || ""
    };
  }

  return {};
}

function getUserPrefix(role) {
  return role === "farmer" ? "FR" : "TR";
}

export async function generateUniqueUserCode(role) {
  const prefix = getUserPrefix(role);

  while (true) {
    const suffix = Math.floor(100000 + Math.random() * 900000).toString();
    const userCode = `${prefix}-${suffix}`;
    const existingUser = await User.findOne({ userCode });

    if (!existingUser) {
      return userCode;
    }
  }
}

export function buildUserResponse(user) {
  return {
    id: user._id,
    userCode: user.userCode,
    role: user.role,
    name: user.name,
    gender: user.gender,
    dob: user.dob,
    email: user.email,
    // social accounts without a phone number get "" (not an internal ID)
    mobile: isRealMobile(user.mobile) ? user.mobile : "",
    state: user.state,
    district: user.district,
    address: user.address,
    pincode: user.pincode,
    phoneVerifiedAt: user.phoneVerifiedAt,
    profile: user.profile || {}
  };
}

async function assertUserDoesNotExist(email, mobile) {
  const existingUser = await User.findOne({
    $or: [{ email }, { mobile }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? "Email" : "Mobile number";
    const error = new Error(`${field} is already registered`);
    error.statusCode = 409;
    throw error;
  }
}

export async function sendOtp(req, res, next) {
  try {
    const { mobile, role, email } = req.body;
    const normalizedMobile = normalizeMobile(mobile);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedMobile || normalizedMobile.length < 10) {
      return res.status(400).json({ message: "Enter a valid mobile number" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address first. The OTP is sent to your email."
      });
    }

    if (!["farmer", "trader"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 60-second cooldown so this can't be used to spam an inbox
    // (skipped in demo mode, where nothing is emailed)
    const recent = isDevOtpAllowed() ? null : await OtpVerification.findOne({
      $or: [
        { mobile: normalizedMobile, role },
        { email: normalizedEmail }
      ],
      createdAt: { $gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000) }
    });

    if (recent) {
      return res.status(429).json({
        message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP`
      });
    }

    const otp = generateOtp();
    await OtpVerification.deleteMany({ mobile: normalizedMobile, role });

    await OtpVerification.create({
      mobile: normalizedMobile,
      role,
      email: normalizedEmail,
      otp: hashOtp(normalizedMobile, role, otp),
      expiresAt: getOtpExpiryDate()
    });

    // actually deliver the OTP (by email) instead of putting it in the response
    let delivered = false;

    // In demo mode nothing is emailed (also avoids waiting on blocked SMTP on Render)
    if (!isDevOtpAllowed() && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
        await sendEmail({
          to: normalizedEmail,
          subject: "Your Krushi Seva verification code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
              <h2>Your verification code</h2>
              <p>Use this code to finish registering on Krushi Seva:</p>
              <p style="font-size:28px;letter-spacing:6px;font-weight:bold;">${otp}</p>
              <p>It expires in ${minutes} minutes. If you didn't request it, you can ignore this email.</p>
            </div>
          `
        });
        delivered = true;
      } catch (emailError) {
        logger.error("Failed to send OTP email", emailError);
      }
    }

    if (!delivered && !isDevOtpAllowed()) {
      await OtpVerification.deleteMany({ mobile: normalizedMobile, role });
      return res.status(502).json({
        message: "We could not send the OTP right now. Please try again in a few minutes."
      });
    }

    return res.status(201).json({
      message: delivered
        ? "OTP sent to your email"
        : "Demo mode: OTP is shown on screen",
      ...(isDevOtpAllowed() ? { devOtp: otp } : {})
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { mobile, role, otp } = req.body;
    const normalizedMobile = normalizeMobile(mobile);

    const otpRecord = await OtpVerification.findOne({
      mobile: normalizedMobile,
      role
    }).sort({ createdAt: -1 });

    // No OTP record found
    if (!otpRecord) {
      return res.status(404).json({
        message: "OTP not found. Please request a new OTP."
      });
    }

    // OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired. Please request a new OTP."
      });
    }

    // FIX 6: Block after 5 wrong attempts
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP."
      });
    }

    // Wrong OTP — increment attempt counter before rejecting
    if (!otpMatches(otpRecord.otp, normalizedMobile, role, otp)) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remaining = 5 - otpRecord.attempts;

      return res.status(400).json({
        message: remaining > 0
          ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Please request a new OTP."
      });
    }

    // OTP is correct — mark as verified
    otpRecord.verified = true;
    otpRecord.verifiedAt = new Date();
    // give a fixed window to finish registering / saving the profile
    otpRecord.expiresAt = new Date(Date.now() + VERIFIED_WINDOW_MINUTES * 60 * 1000);
    await otpRecord.save();

    return res.json({ message: "Phone number verified successfully" });

  } catch (error) {
    next(error);
  }
}

export async function registerUser(req, res, next) {
  try {
    const {
      role,
      name,
      gender,
      dob,
      mobile,
      email,
      password,
      state,
      district,
      address,
      pincode
    } = req.body;

    const normalizedRole = role;
    const normalizedMobile = normalizeMobile(mobile);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!["farmer", "trader"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!name || !normalizedMobile || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, mobile, email and password are required" });
    }

    // the verified OTP must belong to this mobile AND this email
    const verifiedOtp = await OtpVerification.findOne({
      mobile: normalizedMobile,
      role: normalizedRole,
      email: normalizedEmail,
      verified: true,
      expiresAt: { $gt: new Date() } // BATCH C: expired verifications don't count
    }).sort({ verifiedAt: -1 });

    if (!verifiedOtp) {
      return res.status(400).json({
        message: "Phone number is not verified. If you changed your mobile or email, please verify the OTP again."
      });
    }

    await assertUserDoesNotExist(normalizedEmail, normalizedMobile);

    const passwordHash = await bcrypt.hash(password, 10);
    const userCode = await generateUniqueUserCode(normalizedRole);

    const user = await User.create({
      role: normalizedRole,
      userCode,
      name: String(name).trim(),
      gender: gender || "",
      dob: dob || "",
      mobile: normalizedMobile,
      email: normalizedEmail,
      passwordHash,
      state: state || "",
      district: district || "",
      address: address || "",
      pincode: pincode || "",
      phoneVerifiedAt: verifiedOtp.verifiedAt || new Date(),
      profile: buildProfilePayload(normalizedRole, req.body)
    });

    await OtpVerification.deleteMany({ mobile: normalizedMobile, role: normalizedRole });

    return res.status(201).json({
      message: `${normalizedRole === "farmer" ? "Farmer" : "Trader"} registered successfully`,
      user: buildUserResponse(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email or mobile number already exists" });
    }

    next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required" });
    }

    const user = await User.findOne({ email: normalizedEmail, role });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.userCode) {
      user.userCode = await generateUniqueUserCode(user.role);
      await user.save();
    }

    const token = generateToken(user);

    res.json({
   token,
   message: "Login successful",
   user: buildUserResponse(user)
  });
  } catch (error) {
    next(error);
  }
}

// STEP 1: User submits email -> generate reset token -> email a reset link
// the reply is ALWAYS the same and is sent straight away. The lookup and
// the email happen afterwards, so neither the message nor the response time (nor an
// email-sending error) reveals whether an account exists.
async function processForgotPassword(normalizedEmail, role) {
  const user = await User.findOne({ email: normalizedEmail, role });
  if (!user) return;

  const socialOnly = isSocialOnly(user);

  // Generate a random raw token to send to the user, but only store a
  // hashed version in the database (same principle as storing passwords).
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const expiryMinutes = Number(process.env.RESET_PASSWORD_EXPIRY_MINUTES || 15);
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + expiryMinutes * 60 * 1000);
  await user.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  // role comes from the stored account, not from the request
  const resetLink = `${clientUrl}/reset-password/${rawToken}?role=${encodeURIComponent(user.role)}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your Krushi Seva password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Reset your password</h2>
          <p>Hi ${escapeHtml(user.name || "")},</p>
          ${
            socialOnly
              ? `<p>We noticed this account normally signs in with Google. You can keep using "Continue with Google" as usual — or, if you'd like to set up a password as a backup login method, click the button below.</p>`
              : `<p>We received a request to reset your Krushi Seva password. Click the button below to choose a new password. This link expires in ${expiryMinutes} minutes.</p>`
          }
          <p style="text-align:center;">
            <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:6px;">
              ${socialOnly ? "Set a Password" : "Reset Password"}
            </a>
          </p>
          <p>If you didn't request this, you can safely ignore this email — ${socialOnly ? "your Google sign-in will keep working as normal." : "your password will remain unchanged."}</p>
          <p style="color:#888;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br />${resetLink}</p>
        </div>
      `
    });
  } catch (emailError) {
    // Only the server log sees the real reason (Gmail auth, blocked SMTP on Render, ...)
    logger.error("Failed to send password reset email", emailError);
    // Roll back the token so no dangling token is left behind
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}

export async function forgotPassword(req, res) {
  const { email, role } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  res.json({
    message: `If an account exists for ${normalizedEmail}, we've sent a password reset link to it. Please check your inbox (and spam folder).`
  });

  processForgotPassword(normalizedEmail, role).catch((error) => {
    logger.error("Forgot password processing failed", error);
  });
}

// STEP 2: User clicks link, submits new password + token -> verify & update
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // password strength is checked by resetPasswordSchema (validators/schemas.js)

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.hasPassword = true;
    // every login token issued before this moment stops working
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
}