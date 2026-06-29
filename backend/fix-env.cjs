// fix-env.js
// One-time script to fix a multi-line FIREBASE_SERVICE_ACCOUNT_KEY in .env
// by collapsing it into a single valid line.
//
// Usage (from your backend folder):
//   node fix-env.js
//
// This script:
// 1. Reads .env as raw text
// 2. Finds the FIREBASE_SERVICE_ACCOUNT_KEY={ ... } block (which currently
//    spans multiple lines)
// 3. Parses it as JSON to validate it
// 4. Rewrites .env with that JSON collapsed onto a single line
// 5. Backs up your original .env to .env.backup first, just in case

const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");

if (!fs.existsSync(envPath)) {
  console.error("Could not find .env in the current folder. Run this from your backend folder.");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");

// Find where FIREBASE_SERVICE_ACCOUNT_KEY= starts
const marker = "FIREBASE_SERVICE_ACCOUNT_KEY=";
const startIdx = raw.indexOf(marker);

if (startIdx === -1) {
  console.error("Could not find FIREBASE_SERVICE_ACCOUNT_KEY= in .env");
  process.exit(1);
}

const jsonStart = startIdx + marker.length;

if (raw[jsonStart] !== "{") {
  console.error("Expected '{' right after FIREBASE_SERVICE_ACCOUNT_KEY= — the file may already be in a different format. Stopping to avoid making things worse.");
  process.exit(1);
}

// Walk forward counting brace depth to find the matching closing brace,
// correctly skipping over braces that appear inside string values.
let depth = 0;
let inString = false;
let escapeNext = false;
let endIdx = -1;

for (let i = jsonStart; i < raw.length; i++) {
  const ch = raw[i];

  if (escapeNext) {
    escapeNext = false;
    continue;
  }

  if (ch === "\\") {
    escapeNext = true;
    continue;
  }

  if (ch === '"') {
    inString = !inString;
    continue;
  }

  if (inString) continue;

  if (ch === "{") depth++;
  if (ch === "}") {
    depth--;
    if (depth === 0) {
      endIdx = i;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error("Could not find the matching closing '}' for FIREBASE_SERVICE_ACCOUNT_KEY. The JSON may be malformed.");
  process.exit(1);
}

const jsonBlock = raw.slice(jsonStart, endIdx + 1);

let parsed;
try {
  parsed = JSON.parse(jsonBlock);
} catch (e) {
  console.error("Found the block but it is not valid JSON:", e.message);
  console.error("First 80 chars of what was found:", jsonBlock.slice(0, 80));
  process.exit(1);
}

// Required fields sanity check
const requiredFields = ["type", "project_id", "private_key", "client_email"];
const missing = requiredFields.filter((f) => !parsed[f]);
if (missing.length > 0) {
  console.error("Parsed JSON is missing expected fields:", missing.join(", "));
  process.exit(1);
}

const singleLineJson = JSON.stringify(parsed);

const before = raw.slice(0, startIdx);
const after = raw.slice(endIdx + 1);

const newContent = `${before}${marker}${singleLineJson}${after}`;

// Backup original first
fs.writeFileSync(envPath + ".backup", raw, "utf8");
fs.writeFileSync(envPath, newContent, "utf8");

console.log("Success! FIREBASE_SERVICE_ACCOUNT_KEY has been collapsed to a single line.");
console.log("Project ID found:", parsed.project_id);
console.log("Client email found:", parsed.client_email);
console.log("A backup of your original .env was saved as .env.backup");
console.log("\nNow run: npm run dev");
