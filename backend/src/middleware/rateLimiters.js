import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/*
  rate limits.
  Counters live in server memory: they reset when the server restarts, and each
  server instance counts separately. That is fine for a single Render instance.
*/

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function make({ windowMs, limit, message, keyGenerator, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests,
    ...(keyGenerator ? { keyGenerator } : {}),
    // frontend pages already show response.data.message
    handler: (_req, res) => res.status(429).json({ message })
  });
}

// the logged-in user if there is one, otherwise the IP address
const byUserOrIp = (req) =>
  req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip);

/* every /api request, per IP */
export const apiLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 400,
  message: "Too many requests. Please slow down and try again in a few minutes."
});

/* login: failed attempts only (successful logins aren't counted) */
export const loginIpLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 30,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts. Please try again in 15 minutes."
});

/* login: failed attempts against ONE account, from any IP. Use after validate(). */
export const loginAccountLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 8,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    req.body?.email ? `login:${req.body.role}:${req.body.email}` : ipKeyGenerator(req.ip),
  message: "Too many failed attempts for this account. Please try again in 15 minutes or reset your password."
});

export const registerLimiter = make({
  windowMs: HOUR,
  limit: 15,
  message: "Too many registration attempts. Please try again later."
});

export const otpSendLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 20,
  message: "Too many OTP requests. Please try again in a few minutes."
});

export const otpVerifyLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 30,
  message: "Too many OTP attempts. Please try again in a few minutes."
});

export const forgotPasswordLimiter = make({
  windowMs: HOUR,
  limit: 10,
  message: "Too many password reset requests. Please try again later."
});

export const resetPasswordLimiter = make({
  windowMs: HOUR,
  limit: 15,
  message: "Too many attempts. Please try again later."
});

export const socialLoginLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 40,
  message: "Too many login attempts. Please try again in a few minutes."
});

/* AI endpoints: per logged-in user (use AFTER requireAuth) */
export const detectLimiter = make({
  windowMs: HOUR,
  limit: 20,
  keyGenerator: byUserOrIp,
  message: "You have reached the limit of 20 crop photo checks per hour. Please try again later."
});

export const recommendLimiter = make({
  windowMs: HOUR,
  limit: 30,
  keyGenerator: byUserOrIp,
  message: "You have reached the limit of 30 crop recommendations per hour. Please try again later."
});
