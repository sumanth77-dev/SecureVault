import cron from 'node-cron';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Scan documents approaching expiration and create notifications without duplicates
 */
export async function checkExpiringDocuments() {
  try {
    const now = new Date();
    const thirtyDaysFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const expiringDocuments = await db.document.findMany({
      where: {
        expiryDate: {
          not: null,
          lte: thirtyDaysFuture
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    let notificationsCreated = 0;

    for (const doc of expiringDocuments) {
      const exp = new Date(doc.expiryDate);
      const diffMs = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let title = '';
      let message = '';

      if (diffDays < 0) {
        title = 'Document Expired';
        message = `"${doc.name}" has expired on ${exp.toLocaleDateString()}. Please renew or update it.`;
      } else if (diffDays <= 1) {
        title = 'Document Expiring Tomorrow';
        message = `"${doc.name}" expires tomorrow! Urgent renewal may be required.`;
      } else if (diffDays <= 7) {
        title = 'Document Expiring Soon';
        message = `"${doc.name}" will expire in ${diffDays} days on ${exp.toLocaleDateString()}.`;
      } else if (diffDays <= 30) {
        title = 'Upcoming Document Expiry';
        message = `"${doc.name}" is scheduled to expire in ${diffDays} days (${exp.toLocaleDateString()}).`;
      }

      if (title) {
        // Prevent duplicate notification within last 24 hours
        const existingNotification = await db.notification.findFirst({
          where: {
            userId: doc.userId,
            documentId: doc.id,
            type: 'EXPIRY',
            title,
            createdAt: { gte: oneDayAgo }
          }
        });

        if (!existingNotification) {
          await db.notification.create({
            data: {
              userId: doc.userId,
              documentId: doc.id,
              title,
              message,
              type: 'EXPIRY'
            }
          });
          notificationsCreated++;
        }
      }
    }

    if (notificationsCreated > 0) {
      logger.info(`Document Expiry Cron Job: Created ${notificationsCreated} new expiration notifications.`);
    }
  } catch (error) {
    logger.error('Error executing Document Expiry Cron Job:', error);
  }
}

/**
 * Initialize background cron job
 */
export function initCronJobs() {
  // Run every 6 hours: at minute 0 past every 6th hour (00:00, 06:00, 12:00, 18:00)
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Running scheduled document expiry check...');
    await checkExpiringDocuments();
  });

  // Also run an initial check shortly after boot (after 10 seconds)
  setTimeout(() => {
    checkExpiringDocuments();
  }, 10000);

  logger.info('Background Document Expiry Cron Scheduler initialized.');
}
