/*
  CORS settings.
  CLIENT_URL can hold several sites separated by commas, and an entry may use *
  for one part of the host name, e.g.
    CLIENT_URL=https://krushi-seva.vercel.app,https://krushi-seva-*.vercel.app
  The * matches letters, numbers and dashes only (never dots), so it can't be
  used to sneak in another domain. Requests with no Origin header (curl, Render
  health checks) are allowed. Unknown origins just get no CORS headers.
*/
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function toMatcher(entry) {
  if (!entry.includes("*")) {
    return (origin) => origin === entry;
  }
  const pattern = "^" + entry.split("*").map(escapeRegex).join("[a-z0-9-]+") + "$";
  const regex = new RegExp(pattern, "i");
  return (origin) => regex.test(origin);
}

export function parseOrigins(raw = "") {
  return raw
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function buildCorsOptions(clientUrl = process.env.CLIENT_URL || "http://localhost:5173") {
  const matchers = parseOrigins(clientUrl).map(toMatcher);

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      callback(null, matchers.some((matches) => matches(origin)));
    }
  };
}
