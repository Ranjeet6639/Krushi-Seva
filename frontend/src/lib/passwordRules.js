/*
  same password rules as backend/src/utils/passwordRules.js
  (used for NEW passwords: registration and reset). Returns an error message or "".
*/
const COMMON_PASSWORDS = [
  "password", "password1", "password12", "password123", "passw0rd",
  "12345678", "123456789", "1234567890", "11111111", "00000000",
  "qwerty123", "qwertyuiop", "abc12345", "abcd1234", "iloveyou1",
  "admin123", "welcome1", "welcome123", "india123", "krushi123",
  "krushiseva", "krushiseva1", "krushiseva123"
];

export const PASSWORD_HINT = "Password (8+ characters, letters and numbers)";

export function getPasswordError(password = "") {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 72) return "Password must be 72 characters or fewer";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must include at least one letter and one number";
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return "That password is too common. Please choose a different one";
  }
  return "";
}
