import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../errorHelpers/AppError';
import httpStatus from 'http-status';

// In-memory storage for streaming directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Only accept image formats
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'
      )
    );
  }
};

export const uploadBanner = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});
