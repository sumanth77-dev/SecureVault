import multer from 'multer';

// Memory storage for direct streaming to Supabase Storage
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
  const originalName = file.originalname || '';
  const lastDotIndex = originalName.lastIndexOf('.');

  if (lastDotIndex === -1) {
    const error = new Error('File has no extension. Only PDF, JPG, JPEG, PNG, and WEBP files are allowed.');
    error.statusCode = 400;
    return cb(error, false);
  }

  const ext = originalName.substring(lastDotIndex).toLowerCase();

  // Reject executable or disallowed extensions
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error('Invalid file format. Only PDF, JPG, JPEG, PNG, and WEBP files are supported.');
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024
  },
  fileFilter
}).single('file');

export function handleUpload(req, res, next) {
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const customError = new Error(`File exceeds the maximum allowed size of ${maxFileSizeMB}MB.`);
        customError.statusCode = 413;
        return next(customError);
      }
      return next(err);
    }
    next();
  });
}
