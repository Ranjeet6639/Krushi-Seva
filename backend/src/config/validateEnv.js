/*
  checks the environment settings and returns what is wrong.
  (Kept separate from config/env.js so it can be tested without exiting.)
*/
export function checkEnv(env = process.env) {
  const problems = [];
  const warnings = [];
  const isProd = env.NODE_ENV === "production";

  for (const name of ["MONGODB_URI", "JWT_SECRET", "FIREBASE_SERVICE_ACCOUNT_KEY"]) {
    if (!env[name] || !String(env[name]).trim()) {
      problems.push(`${name} is missing`);
    }
  }

  if (env.JWT_SECRET) {
    if (/generate_with|your_|changeme|secret$/i.test(env.JWT_SECRET)) {
      warnings.push("JWT_SECRET looks like a placeholder. Generate a real one (see .env.example).");
    } else if (env.JWT_SECRET.length < 32) {
      warnings.push("JWT_SECRET is shorter than 32 characters. Use a long random value.");
    }
  }

  if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const key = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (!key.private_key || !key.client_email) {
        problems.push("FIREBASE_SERVICE_ACCOUNT_KEY is missing private_key or client_email");
      }
    } catch {
      problems.push("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON (it must be on ONE line)");
    }
  }

  if (isProd && !env.CLIENT_URL) {
    problems.push("CLIENT_URL must be set in production (your Vercel site URL), otherwise browsers block every request");
  }

  for (const name of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
    if (!env[name]) warnings.push(`${name} is not set: crop photo uploads will fail`);
  }

  if (!env.OPENROUTER_API_KEY) {
    warnings.push("OPENROUTER_API_KEY is not set: Sick Crop Detector and What to Grow will use fallbacks or fail");
  }

  if (env.ALLOW_DEV_OTP !== "true" && (!env.EMAIL_USER || !env.EMAIL_PASS)) {
    warnings.push("EMAIL_USER / EMAIL_PASS are not set and ALLOW_DEV_OTP is off: OTP and password-reset emails cannot be sent");
  }

  if (env.ALLOW_DEV_OTP === "true" && isProd) {
    warnings.push("ALLOW_DEV_OTP=true: demo OTP mode is ON in production, so OTPs are shown on screen and phone verification protects nothing");
  }

  return { problems, warnings };
}
