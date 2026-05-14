import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDb } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173"
  })
);

app.use(express.json());

/* IMPORTANT ADD THIS */
app.use(
  "/uploads",
  express.static("uploads")
);

app.get("/api/health", (_req, res) => {
  res.json({
    message:
      "Krushi Seva backend is running"
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/crops", cropRoutes);

app.use((error, _req, res, _next) => {

  const statusCode =
    error.statusCode || 500;

  res.status(statusCode).json({
    message:
      error.message ||
      "Internal server error"
  });

});

connectDb()
  .then(() => {

    app.listen(port, () => {

      console.log(
        `Server running on port ${port}`
      );

    });

  })
  .catch((error) => {

    console.error(
      "Failed to start server",
      error
    );

    process.exit(1);

  });