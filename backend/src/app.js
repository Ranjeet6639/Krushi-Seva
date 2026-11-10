import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import detectRoutes from "./routes/detectRoutes.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import socialAuthRoutes from "./routes/socialAuthRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { buildCorsOptions } from "./config/cors.js";

/*
  The Express app now lives here (server.js only connects the
  database and starts listening). This also lets tests load the real app.
*/
const app = express();

// Render sits behind a proxy. Without this, every visitor looks like the same
// IP address and rate limits would hit everyone at once.
app.set("trust proxy", 1);

// BATCH D: one log line per request
app.use(requestLogger);

// Security headers (hides X-Powered-By, adds nosniff, etc.)
app.use(
  helmet({
    // keeps old /uploads images loadable from the Vercel frontend
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// CORS runs before the rate limiter so even "429 Too many requests" replies
// reach the browser with a readable message.
// CLIENT_URL may list several sites (comma separated, * allowed in a host name)
app.use(cors(buildCorsOptions()));

app.use(express.json({ limit: "100kb" }));

app.use("/uploads", express.static("uploads"));

// before the limiter so Render's health checks never count
// also reports the database. 503 while MongoDB is not connected.
app.get("/api/health", (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;

  res.status(dbUp ? 200 : 503).json({
    message: dbUp
      ? "Krushi Seva backend is running"
      : "Backend is running but the database is not connected",
    db: dbUp ? "connected" : "disconnected"
  });
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/auth", socialAuthRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/detect", detectRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/user", userRoutes);
app.use("/api/offers", offerRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
