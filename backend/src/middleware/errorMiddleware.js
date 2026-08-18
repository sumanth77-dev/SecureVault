import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size exceeds maximum limit of 50MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Prisma Errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'Field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${Array.isArray(target) ? target.join(', ') : target} already exists.`
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record does not exist or was deleted.'
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired'
    });
  }

  // Custom Application Status Error
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message
  });
}
