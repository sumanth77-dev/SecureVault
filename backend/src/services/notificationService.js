import { db } from '../config/database.js';

export const notificationService = {
  async getNotifications(userId) {
    const notifications = await db.notification.findMany({
      where: { userId },
      include: {
        document: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false }
    });

    return {
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type.toLowerCase(),
        read: n.isRead,
        isRead: n.isRead,
        timestamp: n.createdAt.toISOString(),
        documentId: n.documentId,
        documentName: n.document?.name || null,
        actionUrl: n.documentId ? `/documents/${n.documentId}` : '/documents'
      })),
      unreadCount
    };
  },

  async markAsRead(userId, notificationId) {
    const notif = await db.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notif) {
      const error = new Error('Notification not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return updated;
  },

  async markAllAsRead(userId) {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return { message: 'All notifications marked as read.' };
  },

  async deleteNotification(userId, notificationId) {
    const notif = await db.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notif) {
      const error = new Error('Notification not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    await db.notification.delete({
      where: { id: notificationId }
    });

    return { message: 'Notification removed.' };
  },

  async clearAll(userId) {
    await db.notification.deleteMany({
      where: { userId }
    });

    return { message: 'All notifications cleared.' };
  },

  async createNotification({ userId, documentId, title, message, type = 'SYSTEM' }) {
    return await db.notification.create({
      data: {
        userId,
        documentId: documentId || null,
        title,
        message,
        type
      }
    });
  }
};
