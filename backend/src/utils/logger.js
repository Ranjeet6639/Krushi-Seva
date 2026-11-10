/*
  tiny logger (no extra package).
  - production: one JSON object per line, easy to search in Render's log viewer
  - development: short readable lines
  Set LOG_LEVEL=debug|info|warn|error|silent (default: info).
*/
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

function currentLevel() {
  return LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;
}

// Errors don't convert to JSON by themselves, so turn them into plain objects
function serialize(value) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      code: value.code,
      stack: value.stack
    };
  }
  return value;
}

function write(level, msg, meta) {
  if (LEVELS[level] < currentLevel()) return;

  const extra = {};
  if (meta instanceof Error) {
    extra.err = serialize(meta);
  } else if (meta && typeof meta === "object") {
    for (const [key, value] of Object.entries(meta)) extra[key] = serialize(value);
  }

  const line =
    process.env.NODE_ENV === "production"
      ? JSON.stringify({ time: new Date().toISOString(), level, msg, ...extra })
      : `[${level}] ${msg}${Object.keys(extra).length ? " " + JSON.stringify(extra) : ""}`;

  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
}

export const logger = {
  debug: (msg, meta) => write("debug", msg, meta),
  info: (msg, meta) => write("info", msg, meta),
  warn: (msg, meta) => write("warn", msg, meta),
  error: (msg, meta) => write("error", msg, meta)
};
