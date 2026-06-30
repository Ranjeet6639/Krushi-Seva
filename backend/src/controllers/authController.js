import bcrypt from "bcryptjs";
import { OtpVerification } from "../models/OtpVerification.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

function normalizeMobile(mobile = "") {
  return mobile.replace(/\D/g, "");
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(user) {
  return jwt.sign(
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
    mobile: user.mobile,
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
    const { mobile, role } = req.body;
    const normalizedMobile = normalizeMobile(mobile);

    if (!normalizedMobile || normalizedMobile.length < 10) {
      return res.status(400).json({ message: "Enter a valid mobile number" });
    }

    if (!["farmer", "trader"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const otp = generateOtp();
    await OtpVerification.deleteMany({ mobile: normalizedMobile, role });

    await OtpVerification.create({
      mobile: normalizedMobile,
      role,
      otp,
      expiresAt: getOtpExpiryDate()
    });

    return res.status(201).json({
      message: "OTP generated successfully",
      devOtp: otp
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
    if (otpRecord.otp !== otp) {
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

    const verifiedOtp = await OtpVerification.findOne({
      mobile: normalizedMobile,
      role: normalizedRole,
      verified: true
    }).sort({ verifiedAt: -1 });

    if (!verifiedOtp) {
      return res.status(400).json({ message: "Phone number is not verified" });
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