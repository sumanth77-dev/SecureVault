import { db } from '../config/database.js';
import { hashPassword, comparePassword, generateSecureToken, hashToken } from '../utils/hash.js';
import { storageService } from './storageService.js';
import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const getUnlockSecret = () => process.env.JWT_ACCESS_SECRET || 'securevault_unlock_secret_fallback';

export const shareService = {
  /**
   * Create a new secure share link
   */
  async createShareLink(userId, {
    documentId,
    sharedWith = 'External Recipient',
    recipientEmail,
    expiryOption = '24 hours',
    expiresAt: customExpiresAt,
    hasPassword = false,
    password,
    allowDownload = true,
    maxDownloads = null
  }) {
    const doc = await db.document.findFirst({
      where: { id: documentId, userId }
    });

    if (!doc) {
      const error = new Error('Document not found or unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    let calculatedExpiresAt = null;
    const now = Date.now();

    if (customExpiresAt) {
      calculatedExpiresAt = new Date(customExpiresAt);
    } else if (expiryOption && expiryOption !== 'Never') {
      const match = String(expiryOption).trim().match(/^(\d+)\s*(minute|hour|day|second)s?$/i);
      if (match) {
        const val = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        let ms = 0;
        if (unit.startsWith('second')) ms = val * 1000;
        else if (unit.startsWith('minute')) ms = val * 60 * 1000;
        else if (unit.startsWith('hour')) ms = val * 60 * 60 * 1000;
        else if (unit.startsWith('day')) ms = val * 24 * 60 * 60 * 1000;
        calculatedExpiresAt = new Date(now + ms);
      } else if (expiryOption === '15 minutes') {
        calculatedExpiresAt = new Date(now + 15 * 60 * 1000);
      } else if (expiryOption === '30 minutes') {
        calculatedExpiresAt = new Date(now + 30 * 60 * 1000);
      } else if (expiryOption === '1 hour') {
        calculatedExpiresAt = new Date(now + 60 * 60 * 1000);
      } else if (expiryOption === '2 hours') {
        calculatedExpiresAt = new Date(now + 2 * 60 * 60 * 1000);
      } else if (expiryOption === '24 hours') {
        calculatedExpiresAt = new Date(now + 24 * 60 * 60 * 1000);
      } else if (expiryOption === '7 days') {
        calculatedExpiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
      } else if (expiryOption === '30 days') {
        calculatedExpiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Generate random cryptographic raw token and compute SHA-256 token hash
    const rawToken = 'sv_' + generateSecureToken(16);
    const tokenHash = hashToken(rawToken);

    let passwordHash = null;
    if (hasPassword && password && password.trim()) {
      passwordHash = await hashPassword(password.trim());
    }

    const shareLink = await db.shareLink.create({
      data: {
        documentId: doc.id,
        tokenHash,
        passwordHash,
        expiresAt: calculatedExpiresAt,
        allowDownload: Boolean(allowDownload),
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
        sharedWith: sharedWith || 'External Recipient',
        recipientEmail: recipientEmail || null
      },
      include: {
        document: {
          select: { name: true, category: true, fileSize: true }
        }
      }
    });

    // Create Audit Log & Notification
    try {
      await db.auditLog.create({
        data: {
          userId,
          documentId: doc.id,
          action: 'SHARE',
          details: `Created secure share link for "${doc.name}" (Recipient: ${sharedWith})`
        }
      });

      await db.notification.create({
        data: {
          userId,
          documentId: doc.id,
          title: 'Document Shared',
          message: `Created secure access link for "${doc.name}".`,
          type: 'SHARING'
        }
      });
    } catch (e) {
      logger.error('Failed to log share creation:', e);
    }

    return {
      id: shareLink.id,
      token: rawToken, // Returned ONLY ONCE on creation
      documentId: doc.id,
      documentName: doc.name,
      sharedWith: shareLink.sharedWith,
      recipientEmail: shareLink.recipientEmail,
      createdAt: shareLink.createdAt.toISOString(),
      expiresAt: shareLink.expiresAt ? shareLink.expiresAt.toISOString() : null,
      expiryOption,
      hasPassword: Boolean(shareLink.passwordHash),
      allowDownload: shareLink.allowDownload,
      maxDownloads: shareLink.maxDownloads,
      accessCount: shareLink.downloadCount,
      status: 'active'
    };
  },

  /**
   * List all share links for documents owned by user
   */
  async getShares(userId) {
    const shares = await db.shareLink.findMany({
      where: {
        document: { userId }
      },
      include: {
        document: {
          select: { id: true, name: true, category: true, fileSize: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();

    return shares.map(s => {
      let status = 'active';
      if (s.isRevoked) {
        status = 'revoked';
      } else if (s.expiresAt && new Date(s.expiresAt) < now) {
        status = 'expired';
      }

      return {
        id: s.id,
        documentId: s.documentId,
        documentName: s.document?.name || 'Document',
        sharedWith: s.sharedWith || 'External Recipient',
        recipientEmail: s.recipientEmail || '',
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
        hasPassword: Boolean(s.passwordHash),
        allowDownload: s.allowDownload,
        accessCount: s.downloadCount,
        maxDownloads: s.maxDownloads,
        status
      };
    });
  },

  /**
   * Revoke an active share link
   */
  async revokeShare(userId, shareId) {
    const share = await db.shareLink.findFirst({
      where: {
        id: shareId,
        document: { userId }
      },
      include: { document: true }
    });

    if (!share) {
      const error = new Error('Share link not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await db.shareLink.update({
      where: { id: shareId },
      data: { isRevoked: true }
    });

    await db.auditLog.create({
      data: {
        userId,
        documentId: share.documentId,
        action: 'REVOKE_SHARE',
        details: `Revoked share link for document "${share.document?.name}"`
      }
    });

    return {
      id: updated.id,
      status: 'revoked',
      message: 'Share link revoked successfully.'
    };
  },

  /**
   * Delete a share link record
   */
  async deleteShare(userId, shareId) {
    const share = await db.shareLink.findFirst({
      where: {
        id: shareId,
        document: { userId }
      }
    });

    if (!share) {
      const error = new Error('Share link not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    await db.shareLink.delete({
      where: { id: shareId }
    });

    return { message: 'Share record deleted successfully.' };
  },

  /**
   * Public: Get share link metadata and access challenge
   */
  async getPublicShareInfo(rawToken) {
    const tokenHash = hashToken(rawToken);

    const share = await db.shareLink.findUnique({
      where: { tokenHash },
      include: {
        document: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!share) {
      const error = new Error('This secure link does not exist or has been removed.');
      error.statusCode = 404;
      throw error;
    }

    if (share.isRevoked) {
      const error = new Error('This document link has been revoked by the owner.');
      error.statusCode = 410;
      throw error;
    }

    const now = new Date();
    if (share.expiresAt && new Date(share.expiresAt) < now) {
      const error = new Error('This secure link has expired.');
      error.statusCode = 410;
      throw error;
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      const error = new Error('This link has reached its maximum allowable download limit.');
      error.statusCode = 410;
      throw error;
    }

    const doc = share.document;
    const hasPassword = Boolean(share.passwordHash);

    return {
      token: rawToken,
      documentName: doc.name,
      category: doc.category,
      fileSize: doc.fileSize,
      sizeFormatted: formatBytes(doc.fileSize),
      mimeType: doc.mimeType,
      previewType: doc.previewType || 'contract',
      sharedBy: doc.user?.name || 'Vault Owner',
      sharedWith: share.sharedWith || 'Recipient',
      createdAt: share.createdAt.toISOString(),
      expiresAt: share.expiresAt ? share.expiresAt.toISOString() : null,
      allowDownload: share.allowDownload,
      hasPassword,
      isUnlocked: !hasPassword
    };
  },

  /**
   * Public: Verify password passcode and grant temporary unlock token
   */
  async unlockPublicShare(rawToken, password) {
    const tokenHash = hashToken(rawToken);

    const share = await db.shareLink.findUnique({
      where: { tokenHash },
      include: { document: true }
    });

    if (!share) {
      const error = new Error('Share link does not exist or has been removed.');
      error.statusCode = 404;
      throw error;
    }

    if (share.isRevoked) {
      const error = new Error('This document link has been revoked by the owner.');
      error.statusCode = 410;
      error.code = 'SHARE_REVOKED';
      throw error;
    }

    const now = new Date();
    if (share.expiresAt && new Date(share.expiresAt) < now) {
      const error = new Error('This secure link has expired.');
      error.statusCode = 410;
      throw error;
    }

    if (share.passwordHash) {
      const isMatch = await comparePassword(password || '', share.passwordHash);
      if (!isMatch) {
        const error = new Error('Incorrect passcode. Please check with the document owner.');
        error.statusCode = 401;
        throw error;
      }
    }

    // Sign a temporary unlock token (valid for 1 hour)
    const unlockToken = jwt.sign(
      {
        shareId: share.id,
        documentId: share.documentId,
        tokenHash
      },
      getUnlockSecret(),
      { expiresIn: '1h' }
    );

    return {
      isUnlocked: true,
      unlockToken,
      document: {
        id: share.document.id,
        name: share.document.name,
        category: share.document.category,
        fileSize: share.document.fileSize,
        sizeFormatted: formatBytes(share.document.fileSize),
        mimeType: share.document.mimeType,
        previewType: share.document.previewType || 'contract'
      }
    };
  },

  /**
   * Public: Download shared file
   */
  async getPublicDownloadUrl(rawToken, unlockToken, { ipAddress, userAgent } = {}) {
    const tokenHash = hashToken(rawToken);

    const share = await db.shareLink.findUnique({
      where: { tokenHash },
      include: {
        document: {
          include: { user: true }
        }
      }
    });

    if (!share) {
      const error = new Error('Share link does not exist or has been removed.');
      error.statusCode = 404;
      throw error;
    }

    if (share.isRevoked) {
      const error = new Error('This document link has been revoked by the owner.');
      error.statusCode = 410;
      error.code = 'SHARE_REVOKED';
      throw error;
    }

    const now = new Date();
    if (share.expiresAt && new Date(share.expiresAt) < now) {
      const error = new Error('This secure link has expired.');
      error.statusCode = 410;
      throw error;
    }

    if (!share.allowDownload) {
      const error = new Error('File download is disabled for this secure link.');
      error.statusCode = 403;
      throw error;
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      const error = new Error('Download limit reached for this link.');
      error.statusCode = 410;
      throw error;
    }

    if (share.passwordHash) {
      if (!unlockToken) {
        const error = new Error('Passcode verification required before download.');
        error.statusCode = 401;
        throw error;
      }
      try {
        const decoded = jwt.verify(unlockToken, getUnlockSecret());
        if (decoded.shareId !== share.id) {
          throw new Error();
        }
      } catch (err) {
        const error = new Error('Invalid or expired unlock token.');
        error.statusCode = 401;
        throw error;
      }
    }

    // Increment download count
    await db.shareLink.update({
      where: { id: share.id },
      data: { downloadCount: { increment: 1 } }
    });

    // Create Audit Log for owner
    try {
      await db.auditLog.create({
        data: {
          userId: share.document.userId,
          documentId: share.documentId,
          action: 'DOWNLOAD',
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Public Share Recipient',
          details: `Public recipient downloaded "${share.document.name}" via share link`
        }
      });
    } catch (e) {
      logger.error('Failed to log public download audit:', e);
    }

    const downloadUrl = await storageService.getSignedDownloadUrl(share.document.storageKey, share.document.originalFilename);

    return {
      downloadUrl,
      filename: share.document.originalFilename,
      mimeType: share.document.mimeType
    };
  },

  /**
   * Public: Preview shared file
   */
  async getPublicPreviewUrl(rawToken, unlockToken, { ipAddress, userAgent } = {}) {
    const tokenHash = hashToken(rawToken);

    const share = await db.shareLink.findUnique({
      where: { tokenHash },
      include: {
        document: true
      }
    });

    if (!share) {
      const error = new Error('Share link does not exist or has been removed.');
      error.statusCode = 404;
      throw error;
    }

    if (share.isRevoked) {
      const error = new Error('This document link has been revoked by the owner.');
      error.statusCode = 410;
      error.code = 'SHARE_REVOKED';
      throw error;
    }

    const now = new Date();
    if (share.expiresAt && new Date(share.expiresAt) < now) {
      const error = new Error('This secure link has expired.');
      error.statusCode = 410;
      throw error;
    }

    if (share.passwordHash) {
      if (!unlockToken) {
        const error = new Error('Passcode verification required.');
        error.statusCode = 401;
        throw error;
      }
      try {
        const decoded = jwt.verify(unlockToken, getUnlockSecret());
        if (decoded.shareId !== share.id) {
          throw new Error();
        }
      } catch (err) {
        const error = new Error('Invalid or expired unlock token.');
        error.statusCode = 401;
        throw error;
      }
    }

    try {
      await db.auditLog.create({
        data: {
          userId: share.document.userId,
          documentId: share.documentId,
          action: 'VIEW',
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Public Share Recipient',
          details: `Public recipient viewed "${share.document.name}" via share link`
        }
      });
    } catch (e) {
      logger.error('Failed to log public preview audit:', e);
    }

    const previewUrl = await storageService.getSignedPreviewUrl(share.document.storageKey);

    return {
      previewUrl,
      name: share.document.name,
      mimeType: share.document.mimeType,
      previewType: share.document.previewType
    };
  }
};
