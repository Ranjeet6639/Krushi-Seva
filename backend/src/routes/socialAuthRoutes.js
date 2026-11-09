import { Router } from "express";
import { auth } from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";
import {
  generateUniqueUserCode,
  generateToken,
  buildUserResponse
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { socialLoginLimiter } from "../middleware/rateLimiters.js";
import { socialLoginSchema } from "../validators/schemas.js";
import {
  isRealMobile,
  makeUnusableHash,
  placeholderMobile
} from "../utils/userHelpers.js";

const router = Router();

//  rate limit + validation
router.post("/social-login", socialLoginLimiter, validate(socialLoginSchema), async (req, res, next) => {
  try {
    const { firebaseToken, role } = req.body;

    // Verify Firebase ID Token (a bad or expired token is a 401, not a server error)
    let decoded;
    try {
      decoded = await auth.verifyIdToken(firebaseToken);
    } catch (tokenError) {
      console.error("Social login token rejected:", tokenError.code || tokenError.message);
      return res.status(401).json({
        message: "Social login failed. Please try again."
      });
    }

    const { uid, email, name, picture } = decoded;

    // without a verified email we can't tell who owns this address,
    // so we never create or link an account from it.
    if (!email) {
      return res.status(400).json({
        message: "Your account did not share an email address, so we can't sign you in with it."
      });
    }

    if (decoded.email_verified !== true) {
      return res.status(403).json({
        message: "The email on this account isn't verified yet. Please verify it with your sign-in provider, or log in with your email and password."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // find the account by the provider's stable ID first, then by verified email.
    // Before, only email + the role chosen by the browser was used.
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
    }

    // One email = one account (the database enforces it), so a different role is an error
    if (user && user.role !== role) {
      return res.status(409).json({
        message: `This email is registered as a ${user.role}. Please choose "${user.role}" to continue.`
      });
    }

    if (!user) {
      const userCode = await generateUniqueUserCode(role);

      user = await User.create({
        name: name || normalizedEmail.split("@")[0] || "User",
        email: normalizedEmail,
        // no more Firebase ID in the mobile and password fields
        mobile: placeholderMobile(),
        passwordHash: await makeUnusableHash(),
        hasPassword: false,
        role,
        userCode,
        firebaseUid: uid,
        profileImage: picture || ""
        // phoneVerifiedAt is NOT set: a social login does not verify a phone number
      });
    } else {
      let updated = false;

      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        updated = true;
      }

      // upgrade old social accounts that stored the Firebase ID as the password hash
      if (user.firebaseUid && user.passwordHash === user.firebaseUid) {
        user.passwordHash = await makeUnusableHash();
        user.hasPassword = false;
        updated = true;
      }

      // old social accounts were marked "phone verified" even though no phone was given
      if (!isRealMobile(user.mobile) && user.phoneVerifiedAt) {
        user.phoneVerifiedAt = undefined;
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

    const token = generateToken(user);

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
