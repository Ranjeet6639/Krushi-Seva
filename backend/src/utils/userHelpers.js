import bcrypt from "bcryptjs";
import crypto from "crypto";

/* small helpers shared by login, social login and profile code */

export function normalizeMobile(mobile = "") {
  return String(mobile).replace(/\D/g, "");
}

// A real phone number is 10-15 digits. Social-login accounts used to store a
// Firebase ID here, which is NOT a phone number.
export function isRealMobile(mobile) {
  return /^\d{10,15}$/.test(String(mobile || ""));
}

// Placeholder for social accounts that have not added a phone number yet
// (the mobile field is required + unique, so it can't be empty).
export function placeholderMobile() {
  return `social-${crypto.randomBytes(8).toString("hex")}`;
}

// A bcrypt hash of random bytes: nobody knows the password, so password login is impossible
export async function makeUnusableHash() {
  return bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
}

// true for accounts that only sign in with Google/Apple/Microsoft (no password set yet)
export function isSocialOnly(user) {
  return (
    user.hasPassword === false ||
    // old accounts created before Batch C stored the Firebase ID as the "hash"
    (Boolean(user.firebaseUid) && user.passwordHash === user.firebaseUid)
  );
}
