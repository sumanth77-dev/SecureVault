import { db } from '../config/database.js';

export const auditService = {
  async getAuditLogs(userId, { limit = 50, action } = {}) {
    const where = { userId };
    if (action) {
      where.action = action;
    }

    const logs = await db.auditLog.findMany({
      where,
      include: {
        document: {
          select: { id: true, name: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit) || 50
    });

    return logs.map(l => {
      let badge = 'Activity';
      let type = 'system';
      if (l.action === 'UPLOAD') { badge = 'Uploaded'; type = 'upload'; }
      else if (l.action === 'DOWNLOAD') { badge = 'Downloaded'; type = 'download'; }
      else if (l.action === 'VIEW') { badge = 'Viewed'; type = 'view'; }
      else if (l.action === 'SHARE') { badge = 'Shared'; type = 'share'; }
      else if (l.action === 'REVOKE_SHARE') { badge = 'Revoked'; type = 'security'; }
      else if (l.action === 'DELETE') { badge = 'Deleted'; type = 'delete'; }
      else if (l.action === 'PASSWORD_CHANGE' || l.action === 'LOGIN') { badge = 'Security'; type = 'security'; }

      return {
        id: l.id,
        type,
        action: l.action,
        title: l.document?.name ? `${l.action.replace('_', ' ')}: ${l.document.name}` : l.details || l.action,
        description: l.details || `Performed ${l.action}`,
        timestamp: l.createdAt.toISOString(),
        documentId: l.documentId,
        documentName: l.document?.name || null,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        badge
      };
    });
  },

  async createAuditLog({ userId, documentId, action, ipAddress, userAgent, details }) {
    return await db.auditLog.create({
      data: {
        userId,
        documentId: documentId || null,
        action,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'System',
        details: details || null
      }
    });
  }
};
