// multer.config.ts
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const multerConfig: MulterOptions = {
//   storage: multer.memoryStorage(), // or diskStorage if you're saving to disk
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB

    // NOTE: file.size might not be populated here when using memoryStorage
    // Instead, perform size validation in the service if needed
    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only image or video files are allowed'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // max possible, validate actual type/size later
  },
};
