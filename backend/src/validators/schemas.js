import { z } from "zod";
import { getPasswordProblem } from "../utils/passwordRules.js";

/*
  one place that describes what every request is allowed to contain.
  Anything not listed here is dropped, wrong types are rejected (this also stops
  NoSQL injection such as { "email": { "$gt": "" } }), and text lengths are capped.
*/

export const ROLES = ["farmer", "trader"];
export const CROP_CATEGORIES = ["Vegetable", "Fruit", "Grains", "Pulses"];

/* ---------- small building blocks ---------- */

const role = z.enum(ROLES, { error: "Invalid role" });

const reqStr = (label, max = 100) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);

const optStr = (label, max = 100) =>
  z.string({ error: `${label} is invalid` }).trim().max(max, `${label} is too long`).nullish();

const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

// Keeps digits only, then checks the length (same rule the controller used)
const mobile = z
  .string({ error: "Mobile number is required" })
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length >= 10 && v.length <= 15, "Enter a valid mobile number");

// stronger rule for new passwords (see utils/passwordRules.js)
const newPassword = z
  .string({ error: "Password is required" })
  .superRefine((value, ctx) => {
    const problem = getPasswordProblem(value);
    if (problem) ctx.addIssue({ code: "custom", message: problem });
  });

const positiveNumber = (label, max) =>
  z
    .any()
    .transform((v) => (v === "" || v === null || v === undefined ? NaN : Number(v)))
    .refine(
      (n) => Number.isFinite(n) && n > 0 && n <= max,
      `${label} must be a number greater than 0`
    );

/* ---------- auth ---------- */

export const sendOtpSchema = z.object({ mobile, role, email });

export const verifyOtpSchema = z.object({
  mobile,
  role,
  otp: z
    .string({ error: "OTP is required" })
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits")
});

export const registerSchema = z.object({
  role,
  name: reqStr("Name", 100),
  gender: optStr("Gender", 20),
  dob: optStr("Date of birth", 20),
  mobile,
  email,
  password: newPassword,
  state: optStr("State"),
  district: optStr("District"),
  address: optStr("Address", 300),
  pincode: optStr("Pincode", 10),
  // farmer-only extras read by buildProfilePayload()
  ration: optStr("Ration card", 50),
  fileName: optStr("File name", 200),
  taluka: optStr("Taluka"),
  village: optStr("Village")
});

export const loginSchema = z.object({
  email,
  // no minimum here: older accounts may have short passwords
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required")
    .max(128, "Password is too long"),
  role
});

export const forgotPasswordSchema = z.object({ email, role });

export const resetPasswordSchema = z.object({
  token: z
    .string({ error: "Reset link is invalid or has expired" })
    .trim()
    .min(10, "Reset link is invalid or has expired")
    .max(200, "Reset link is invalid or has expired"),
  password: newPassword
});

export const socialLoginSchema = z.object({
  firebaseToken: z
    .string({ error: "Firebase token is required" })
    .min(10, "Firebase token is invalid")
    .max(4096, "Firebase token is invalid"),
  role
});

/* ---------- profile ---------- */

export const profileSchema = z.object({
  name: optStr("Name", 100),
  gender: optStr("Gender", 20),
  dob: optStr("Date of birth", 20),
  // Format + OTP re-verification are checked in routes/userRoutes.js (BATCH C),
  // because old social accounts may still send a non-number here unchanged.
  mobile: optStr("Mobile number", 30),
  state: optStr("State"),
  district: optStr("District"),
  address: optStr("Address", 300),
  pincode: optStr("Pincode", 10),
  village: optStr("Village"),
  taluka: optStr("Taluka"),
  ration: optStr("Ration card", 50)
});

/* ---------- crops & offers ---------- */

export const cropSchema = z.object({
  name: reqStr("Crop name", 80),
  quantity: positiveNumber("Quantity", 1000000),
  price: positiveNumber("Price", 100000),
  category: z.enum(CROP_CATEGORIES, { error: "Invalid crop category" }).default("Vegetable")
});

export const offerSchema = z.object({
  cropId: z
    .string({ error: "A valid crop is required" })
    .regex(/^[a-f\d]{24}$/i, "A valid crop is required"),
  offerPrice: positiveNumber("Offer price", 100000),
  quantity: positiveNumber("Quantity", 1000000),
  message: z
    .string({ error: "Message is invalid" })
    .nullish()
    .transform((v) => String(v ?? "").trim().slice(0, 500))
});

export const offerStatusSchema = z.object({
  status: z.enum(["Accepted", "Rejected"], { error: "Status must be Accepted or Rejected" })
});

/* ---------- AI crop recommendation ---------- */

/*
  Text that ends up inside an AI prompt: control characters and line breaks are
  removed and the length is capped, so a farmer can't paste in instructions
  like "ignore the above and ...".
*/
const promptText = z
  .string({ error: "Form values must be text" })
  .nullish()
  .transform((v) =>
    String(v ?? "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100)
  );

export const recommendSchema = z.object({
  formData: z.object(
    {
      location: promptText,
      season: promptText,
      soil: promptText,
      irrigation: promptText,
      water: promptText,
      previousCrop: promptText,
      preference: promptText,
      budget: promptText
    },
    { error: "formData is required" }
  )
});
