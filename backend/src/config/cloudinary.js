import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* upload restrictions (previously there were none) */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Use memory storage — upload buffer directly to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
    }
  }
});

/*
  The browser tells us the MIME type, so it can be faked.
  This checks the first bytes of the real file ("magic bytes").
*/
export function looksLikeImage(buffer) {
  if (!buffer || buffer.length < 12) return false;

  const isJpeg =
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
    buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
    buffer[6] === 0x1a && buffer[7] === 0x0a;

  const isWebp =
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  return isJpeg || isPng || isWebp;
}

/*
  Wrapper around upload.single() so upload problems return a clean
  400 message instead of a generic 500 error.
*/
export function handleImageUpload(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5 MB or smaller"
            : err.message || "Image upload failed";
        return res.status(400).json({ message });
      }

      if (req.file && !looksLikeImage(req.file.buffer)) {
        return res.status(400).json({
          message: "The uploaded file is not a valid JPG, PNG, or WEBP image"
        });
      }

      next();
    });
  };
}

// Call this in your controller after multer runs
export async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "krushi-seva-crops",
        resource_type: "image",                     // BATCH A: images only
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

export default cloudinary;
