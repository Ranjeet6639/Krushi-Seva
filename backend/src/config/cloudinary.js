import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — upload buffer directly to Cloudinary
export const upload = multer({ storage: multer.memoryStorage() });

// Call this in your controller after multer runs
export async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "krushi-seva-crops" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

export default cloudinary;