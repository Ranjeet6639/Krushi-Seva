import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(mongoUri);
  logger.info("MongoDB connected");
}
