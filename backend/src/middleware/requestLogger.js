import { logger } from "../utils/logger.js";

/*
  one log line per request (method, path, status, time, user).
  The query string and request body are NOT logged, so passwords, tokens and
  OTPs never end up in the logs. Health checks are skipped.
*/
export function requestLogger(req, res, next) {
  if (req.path === "/api/health") return next();

  const started = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    logger[level]("request", {
      method: req.method,
      path: req.originalUrl.split("?")[0],
      status,
      ms: Math.round(ms),
      ip: req.ip,
      userId: req.user?.id
    });
  });

  next();
}
