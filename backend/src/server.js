// must be first: loads .env and stops with a clear message if settings are missing
import "./config/env.js";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import mongoose from "mongoose";
import app from "./app.js";
import { connectDb } from "./config/db.js";
import { logger } from "./utils/logger.js";

const port = process.env.PORT || 5000;

let server;
let shuttingDown = false;

/*
  graceful shutdown. Render sends SIGTERM on every deploy/restart:
  stop taking new requests, let running ones finish, close MongoDB, then exit.
*/
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("Shutting down", { signal });

  const forceExit = setTimeout(() => {
    logger.error("Shutdown took too long, forcing exit");
    process.exit(1);
  }, 10000);
  forceExit.unref();

  if (!server) process.exit(0);

  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch (error) {
      logger.error("Error closing MongoDB connection", error);
    }
    logger.info("Shutdown complete");
    process.exit(0);
  });
  server.closeIdleConnections?.();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { err: reason });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
  shutdown("uncaughtException");
});

connectDb()
  .then(() => {
    server = app.listen(port, () => {
      logger.info("Server running", { port });
    });
  })
  .catch((error) => {
    logger.error("Failed to start server", error);
    process.exit(1);
  });
