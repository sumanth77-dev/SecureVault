import app from './app.js';
import { connectDB } from './config/database.js';
import { initCronJobs } from './services/cronService.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Attempt database connection
    await connectDB();

    // Initialize background cron jobs
    initCronJobs();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 SecureVault Backend API running on port ${PORT}`);
      logger.info(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🛡️ CORS Allowed: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });

    // Graceful shutdown
    const handleShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
