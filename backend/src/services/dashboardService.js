import { db } from '../config/database.js';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const dashboardService = {
  async getDashboardMetrics(userId) {
    const now = new Date();
    const thirtyDaysFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalDocuments,
      totalFolders,
      allDocs,
      recentDocs,
      expiringDocs,
      sharedCount,
      recentActivityLogs
    ] = await Promise.all([
      db.document.count({ where: { userId } }),
      db.folder.count({ where: { userId } }),
      db.document.findMany({
        where: { userId },
        select: { fileSize: true, mimeType: true, name: true, expiryDate: true }
      }),
      db.document.findMany({
        where: { userId },
        include: { folder: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      db.document.findMany({
        where: {
          userId,
          expiryDate: {
            not: null,
            lte: thirtyDaysFuture
          }
        },
        orderBy: { expiryDate: 'asc' },
        take: 10
      }),
      db.shareLink.count({
        where: {
          document: { userId },
          isRevoked: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }),
      db.auditLog.findMany({
        where: { userId },
        include: { document: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    let totalSizeBytes = 0;
    let pdfBytes = 0;
    let imageBytes = 0;
    let docBytes = 0;
    let otherBytes = 0;
    let expiringSoonCount = 0;

    allDocs.forEach(d => {
      totalSizeBytes += d.fileSize || 0;

      if (d.expiryDate) {
        const exp = new Date(d.expiryDate);
        if (exp <= thirtyDaysFuture) {
          expiringSoonCount++;
        }
      }

      const mime = (d.mimeType || '').toLowerCase();
      const ext = d.name.includes('.') ? d.name.substring(d.name.lastIndexOf('.') + 1).toLowerCase() : '';

      if (mime.includes('pdf') || ext === 'pdf') {
        pdfBytes += d.fileSize || 0;
      } else if (mime.includes('image') || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
        imageBytes += d.fileSize || 0;
      } else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        docBytes += d.fileSize || 0;
      } else {
        otherBytes += d.fileSize || 0;
      }
    });

    const storageLimitMB = 1024; // 1 GB
    const storageLimitBytes = storageLimitMB * 1024 * 1024;
    const storageUsedMB = parseFloat((totalSizeBytes / (1024 * 1024)).toFixed(1));
    const storagePercentage = Math.min(100, Math.round((totalSizeBytes / storageLimitBytes) * 100));

    const storageBreakdown = [
      { name: 'PDF Documents', value: parseFloat((pdfBytes / (1024 * 1024)).toFixed(1)), color: '#2563eb' },
      { name: 'Scanned Images', value: parseFloat((imageBytes / (1024 * 1024)).toFixed(1)), color: '#059669' },
      { name: 'Certificates & Text', value: parseFloat((docBytes / (1024 * 1024)).toFixed(1)), color: '#6366f1' },
      { name: 'Other Archives', value: parseFloat((otherBytes / (1024 * 1024)).toFixed(1)), color: '#64748b' }
    ];

    const formattedRecentDocs = recentDocs.map(d => ({
      id: d.id,
      name: d.name,
      title: d.name.replace(/\.[^/.]+$/, ''),
      category: d.category,
      folderName: d.folder?.name || null,
      sizeFormatted: formatBytes(d.fileSize),
      sizeBytes: d.fileSize,
      fileType: d.name.includes('.') ? d.name.substring(d.name.lastIndexOf('.') + 1).toLowerCase() : 'pdf',
      uploadedAt: d.createdAt.toISOString(),
      expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
      isStarred: d.isStarred
    }));

    const formattedExpiringDocs = expiringDocs.map(d => {
      const exp = new Date(d.expiryDate);
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return {
        id: d.id,
        name: d.name,
        category: d.category,
        expiryDate: d.expiryDate.toISOString(),
        daysRemaining: diffDays,
        status: diffDays < 0 ? 'expired' : 'expiring'
      };
    });

    const recentActivity = recentActivityLogs.map(l => {
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
        badge
      };
    });

    return {
      totalDocuments,
      totalFolders,
      totalShared: sharedCount,
      expiringSoon: expiringSoonCount,
      storageUsed: totalSizeBytes,
      storageUsedMB,
      storageLimit: storageLimitBytes,
      storageLimitMB,
      storagePercentage,
      storageBreakdown,
      recentDocuments: formattedRecentDocs,
      expiringDocuments: formattedExpiringDocs,
      recentActivity
    };
  }
};
