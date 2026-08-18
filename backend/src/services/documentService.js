import crypto from 'crypto';
import { db } from '../config/database.js';
import { storageService } from './storageService.js';
import { logger } from '../utils/logger.js';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return { status: 'valid', label: 'No Expiry' };
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'expired', label: 'Expired', days: diffDays };
  if (diffDays <= 30) return { status: 'expiring', label: `Expires in ${diffDays}d`, days: diffDays };
  return { status: 'valid', label: 'Valid', days: diffDays };
}

export const documentService = {
  /**
   * List documents with multi-field search, filtering, pagination, and sorting
   */
  async getDocuments(userId, { search, category, folderId, isStarred, sort = 'newest', page = 1, limit = 50 } = {}) {
    const where = { userId };

    if (folderId) {
      where.folderId = folderId;
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (isStarred !== undefined) {
      where.isStarred = isStarred === 'true' || isStarred === true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { originalFilename: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'name') orderBy = { name: 'asc' };
    if (sort === 'size') orderBy = { fileSize: 'desc' };
    if (sort === 'expiry') orderBy = { expiryDate: 'asc' };

    const take = parseInt(limit, 10) || 50;
    const skip = ((parseInt(page, 10) || 1) - 1) * take;

    const [total, documents] = await Promise.all([
      db.document.count({ where }),
      db.document.findMany({
        where,
        include: {
          folder: { select: { id: true, name: true, color: true } },
          versions: { orderBy: { createdAt: 'desc' } },
          _count: { select: { shareLinks: true } }
        },
        orderBy,
        skip,
        take
      })
    ]);

    const formatted = documents.map(d => {
      const ext = d.name.includes('.') ? d.name.substring(d.name.lastIndexOf('.') + 1).toLowerCase() : 'pdf';
      const expiry = getExpiryStatus(d.expiryDate);
      return {
        id: d.id,
        name: d.name,
        title: d.name.replace(/\.[^/.]+$/, ''),
        originalFilename: d.originalFilename,
        folderId: d.folderId,
        folderName: d.folder?.name || null,
        category: d.category,
        fileType: ext,
        mimeType: d.mimeType,
        sizeBytes: d.fileSize,
        sizeFormatted: formatBytes(d.fileSize),
        uploadedAt: d.createdAt.toISOString(),
        expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
        status: expiry.status,
        description: d.description || '',
        isStarred: d.isStarred,
        previewType: d.previewType || 'contract',
        sharesCount: d._count?.shareLinks || 0,
        versions: (d.versions || []).map(v => ({
          id: v.id,
          version: v.versionNumber,
          date: v.createdAt.toISOString().split('T')[0],
          notes: v.notes || 'Document revision',
          size: formatBytes(v.fileSize)
        }))
      };
    });

    return {
      documents: formatted,
      pagination: {
        total,
        page: parseInt(page, 10) || 1,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    };
  },

  /**
   * Get single document details with versions, audit trail, and share records
   */
  async getDocumentById(userId, documentId) {
    const doc = await db.document.findFirst({
      where: { id: documentId, userId },
      include: {
        folder: true,
        versions: { orderBy: { createdAt: 'desc' } },
        shareLinks: { orderBy: { createdAt: 'desc' } },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 }
      }
    });

    if (!doc) {
      const error = new Error('Document not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const ext = doc.name.includes('.') ? doc.name.substring(doc.name.lastIndexOf('.') + 1).toLowerCase() : 'pdf';
    const expiry = getExpiryStatus(doc.expiryDate);

    return {
      id: doc.id,
      name: doc.name,
      title: doc.name.replace(/\.[^/.]+$/, ''),
      originalFilename: doc.originalFilename,
      folderId: doc.folderId,
      folderName: doc.folder?.name || null,
      category: doc.category,
      fileType: ext,
      mimeType: doc.mimeType,
      sizeBytes: doc.fileSize,
      sizeFormatted: formatBytes(doc.fileSize),
      uploadedAt: doc.createdAt.toISOString(),
      expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
      status: expiry.status,
      description: doc.description || '',
      isStarred: doc.isStarred,
      previewType: doc.previewType || 'contract',
      versions: (doc.versions || []).map(v => ({
        id: v.id,
        version: v.versionNumber,
        date: v.createdAt.toISOString().split('T')[0],
        notes: v.notes || 'Document revision',
        size: formatBytes(v.fileSize)
      })),
      activityLog: (doc.auditLogs || []).map(a => ({
        id: a.id,
        action: a.action,
        timestamp: a.createdAt.toISOString(),
        details: a.details || a.action
      })),
      shareLinks: (doc.shareLinks || []).map(s => ({
        id: s.id,
        expiresAt: s.expiresAt,
        allowDownload: s.allowDownload,
        downloadCount: s.downloadCount,
        maxDownloads: s.maxDownloads,
        isRevoked: s.isRevoked,
        sharedWith: s.sharedWith,
        recipientEmail: s.recipientEmail,
        createdAt: s.createdAt
      }))
    };
  },

  /**
   * Upload and process a new document with storage compensation logic
   */
  async uploadDocument(userId, { file, name, category, folderId, description, expiryDate, previewType, ipAddress, userAgent }) {
    if (!file) {
      const error = new Error('No file provided for upload.');
      error.statusCode = 400;
      throw error;
    }

    const docName = (name && name.trim()) || file.originalname;
    const initialCategory = category || 'Personal';

    // Verify folder belongs to user if provided
    if (folderId) {
      const folderExists = await db.folder.findFirst({
        where: { id: folderId, userId }
      });
      if (!folderExists) {
        folderId = null;
      }
    }

    const documentId = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    let uploadedStorageKey = null;

    try {
      // Step 1: Upload version 1 file to Supabase Storage
      const { storageKey } = await storageService.uploadFile({
        userId,
        documentId,
        versionNumber: 1,
        filename: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype
      });
      uploadedStorageKey = storageKey;

      // Step 2: Store Document and Version metadata in PostgreSQL
      const newDoc = await db.document.create({
        data: {
          id: documentId,
          userId,
          folderId: folderId || null,
          name: docName,
          originalFilename: file.originalname,
          category: initialCategory,
          description: description || 'Uploaded securely to encrypted vault storage.',
          storageKey,
          mimeType: file.mimetype,
          fileSize: file.size,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          previewType: previewType || 'contract',
          versions: {
            create: [
              {
                storageKey,
                versionNumber: 'v1.0',
                originalFilename: file.originalname,
                mimeType: file.mimetype,
                fileSize: file.size,
                notes: 'Initial upload'
              }
            ]
          }
        },
        include: {
          folder: true,
          versions: true
        }
      });

      // Step 3: Log audit action
      try {
        await db.auditLog.create({
          data: {
            userId,
            documentId: newDoc.id,
            action: 'UPLOAD',
            ipAddress: ipAddress || '127.0.0.1',
            userAgent: userAgent || 'Browser',
            details: `Uploaded new document "${newDoc.name}" (${formatBytes(file.size)})`
          }
        });
      } catch (logErr) {
        logger.error('Failed to create upload audit log:', logErr);
      }

      const expiry = getExpiryStatus(newDoc.expiryDate);
      const ext = newDoc.name.includes('.') ? newDoc.name.substring(newDoc.name.lastIndexOf('.') + 1).toLowerCase() : 'pdf';

      return {
        id: newDoc.id,
        name: newDoc.name,
        title: newDoc.name.replace(/\.[^/.]+$/, ''),
        originalFilename: newDoc.originalFilename,
        folderId: newDoc.folderId,
        folderName: newDoc.folder?.name || null,
        category: newDoc.category,
        fileType: ext,
        sizeBytes: newDoc.fileSize,
        sizeFormatted: formatBytes(newDoc.fileSize),
        uploadedAt: newDoc.createdAt.toISOString(),
        expiryDate: newDoc.expiryDate ? newDoc.expiryDate.toISOString() : null,
        status: expiry.status,
        description: newDoc.description,
        isStarred: newDoc.isStarred,
        previewType: newDoc.previewType,
        versions: (newDoc.versions || []).map(v => ({
          id: v.id,
          version: v.versionNumber,
          date: v.createdAt.toISOString().split('T')[0],
          notes: v.notes || 'Document revision',
          size: formatBytes(v.fileSize)
        }))
      };
    } catch (err) {
      // Compensation logic: delete uploaded storage file if DB creation failed
      if (uploadedStorageKey) {
        logger.warn(`Compensating failure: cleaning up uploaded storage file ${uploadedStorageKey}`);
        await storageService.deleteFile(uploadedStorageKey);
      }
      throw err;
    }
  },

  /**
   * Upload a new version to an existing document
   */
  async uploadVersion(userId, documentId, { file, notes, ipAddress, userAgent }) {
    if (!file) {
      const error = new Error('No file provided for new version.');
      error.statusCode = 400;
      throw error;
    }

    const doc = await db.document.findFirst({
      where: { id: documentId, userId },
      include: { versions: { orderBy: { createdAt: 'desc' } } }
    });

    if (!doc) {
      const error = new Error('Document not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const nextVersionNum = (doc.versions?.length || 0) + 1;
    const versionLabel = `v${nextVersionNum}.0`;
    let uploadedKey = null;

    try {
      // Upload new version to Supabase Storage
      const { storageKey } = await storageService.uploadFile({
        userId,
        documentId,
        versionNumber: nextVersionNum,
        filename: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype
      });
      uploadedKey = storageKey;

      // Create DocumentVersion record & update active Document pointers
      const [versionRecord, updatedDoc] = await Promise.all([
        db.documentVersion.create({
          data: {
            documentId,
            storageKey,
            versionNumber: versionLabel,
            originalFilename: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            notes: notes || `Updated to version ${versionLabel}`
          }
        }),
        db.document.update({
          where: { id: documentId },
          data: {
            storageKey,
            fileSize: file.size,
            mimeType: file.mimetype,
            originalFilename: file.originalname
          }
        })
      ]);

      // Audit Log
      try {
        await db.auditLog.create({
          data: {
            userId,
            documentId,
            action: 'UPLOAD',
            ipAddress: ipAddress || '127.0.0.1',
            userAgent: userAgent || 'Browser',
            details: `Uploaded new version ${versionLabel} for "${doc.name}" (${formatBytes(file.size)})`
          }
        });
      } catch (logErr) {
        logger.error('Failed to create version audit log:', logErr);
      }

      return {
        id: versionRecord.id,
        version: versionRecord.versionNumber,
        originalFilename: versionRecord.originalFilename,
        fileSize: versionRecord.fileSize,
        sizeFormatted: formatBytes(versionRecord.fileSize),
        notes: versionRecord.notes,
        createdAt: versionRecord.createdAt.toISOString()
      };
    } catch (err) {
      if (uploadedKey) {
        await storageService.deleteFile(uploadedKey);
      }
      throw err;
    }
  },

  /**
   * Update document metadata (rename, category, folder, expiry, starred)
   */
  async updateDocument(userId, documentId, updateFields = {}, { ipAddress, userAgent } = {}) {
    const existing = await db.document.findFirst({
      where: { id: documentId, userId }
    });

    if (!existing) {
      const error = new Error('Document not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const dataToUpdate = {};

    if (updateFields.name !== undefined) dataToUpdate.name = updateFields.name.trim();
    if (updateFields.category !== undefined) dataToUpdate.category = updateFields.category;
    if (updateFields.description !== undefined) dataToUpdate.description = updateFields.description;
    if (updateFields.isStarred !== undefined) dataToUpdate.isStarred = Boolean(updateFields.isStarred);
    if (updateFields.previewType !== undefined) dataToUpdate.previewType = updateFields.previewType;
    if (updateFields.expiryDate !== undefined) {
      dataToUpdate.expiryDate = updateFields.expiryDate ? new Date(updateFields.expiryDate) : null;
    }
    if (updateFields.folderId !== undefined) {
      if (updateFields.folderId) {
        const folder = await db.folder.findFirst({
          where: { id: updateFields.folderId, userId }
        });
        dataToUpdate.folderId = folder ? folder.id : null;
      } else {
        dataToUpdate.folderId = null;
      }
    }

    const updated = await db.document.update({
      where: { id: documentId },
      data: dataToUpdate,
      include: { folder: true }
    });

    if (updateFields.name && updateFields.name !== existing.name) {
      try {
        await db.auditLog.create({
          data: {
            userId,
            documentId,
            action: 'RENAME',
            ipAddress: ipAddress || '127.0.0.1',
            userAgent: userAgent || 'Browser',
            details: `Renamed document from "${existing.name}" to "${updated.name}"`
          }
        });
      } catch (logErr) {
        logger.error('Failed to log rename action:', logErr);
      }
    }

    const expiry = getExpiryStatus(updated.expiryDate);
    const ext = updated.name.includes('.') ? updated.name.substring(updated.name.lastIndexOf('.') + 1).toLowerCase() : 'pdf';

    return {
      id: updated.id,
      name: updated.name,
      title: updated.name.replace(/\.[^/.]+$/, ''),
      originalFilename: updated.originalFilename,
      folderId: updated.folderId,
      folderName: updated.folder?.name || null,
      category: updated.category,
      fileType: ext,
      sizeBytes: updated.fileSize,
      sizeFormatted: formatBytes(updated.fileSize),
      uploadedAt: updated.createdAt.toISOString(),
      expiryDate: updated.expiryDate ? updated.expiryDate.toISOString() : null,
      status: expiry.status,
      description: updated.description,
      isStarred: updated.isStarred
    };
  },

  /**
   * Delete document and all corresponding storage objects & database records
   */
  async deleteDocument(userId, documentId, { ipAddress, userAgent } = {}) {
    const doc = await db.document.findFirst({
      where: { id: documentId, userId },
      include: { versions: true }
    });

    if (!doc) {
      const error = new Error('Document not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    // Step 1: Collect all storage keys to delete from Supabase Storage
    const storageKeysToDelete = new Set();
    if (doc.storageKey) storageKeysToDelete.add(doc.storageKey);
    (doc.versions || []).forEach(v => {
      if (v.storageKey) storageKeysToDelete.add(v.storageKey);
    });

    // Step 2: Delete files from Supabase Storage
    await storageService.deleteFiles(Array.from(storageKeysToDelete));

    // Step 3: Delete database records
    await db.document.delete({
      where: { id: documentId }
    });

    // Step 4: Audit log
    try {
      await db.auditLog.create({
        data: {
          userId,
          action: 'DELETE',
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Browser',
          details: `Deleted document "${doc.name}" and purged all stored files`
        }
      });
    } catch (logErr) {
      logger.error('Failed to log delete action:', logErr);
    }

    return { message: `Document "${doc.name}" deleted successfully.` };
  },

  /**
   * Generate temporary signed download link
   */
  async getDownloadUrl(userId, documentId, { ipAddress, userAgent } = {}) {
    const doc = await db.document.findFirst({
      where: { id: documentId, userId }
    });

    if (!doc) {
      const error = new Error('Document not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const downloadUrl = await storageService.getSignedDownloadUrl(doc.storageKey, doc.originalFilename, 300);

    try {
      await db.auditLog.create({
        data: {
          userId,
          documentId,
          action: 'DOWNLOAD',
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Browser',
          details: `Downloaded "${doc.name}"`
        }
      });
    } catch (logErr) {
      logger.error('Failed to log download action:', logErr);
    }

    return {
      downloadUrl,
      filename: doc.originalFilename,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize
    };
  },

  /**
   * Generate temporary signed preview link for canvas viewing
   */
  async getPreviewUrl(userId, documentId, { ipAddress, userAgent } = {}) {
    const doc = await db.document.findFirst({
      where: { id: documentId, userId }
    });

    if (!doc) {
      const error = new Error('Document not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const previewUrl = await storageService.getSignedPreviewUrl(doc.storageKey, 600);

    try {
      await db.auditLog.create({
        data: {
          userId,
          documentId,
          action: 'VIEW',
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Browser',
          details: `Previewed document "${doc.name}"`
        }
      });
    } catch (logErr) {
      logger.error('Failed to log view action:', logErr);
    }

    return {
      previewUrl,
      name: doc.name,
      mimeType: doc.mimeType,
      previewType: doc.previewType
    };
  },

  /**
   * Get expiring documents for alerts
   */
  async getExpiringDocuments(userId) {
    const now = new Date();
    const thirtyDaysFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const docs = await db.document.findMany({
      where: {
        userId,
        expiryDate: {
          not: null,
          lte: thirtyDaysFuture
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    const expired = [];
    const expiringIn7Days = [];
    const expiringIn30Days = [];
    const sevenDaysFuture = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    docs.forEach(doc => {
      const exp = new Date(doc.expiryDate);
      const formatted = {
        id: doc.id,
        name: doc.name,
        category: doc.category,
        expiryDate: doc.expiryDate.toISOString(),
        fileSize: formatBytes(doc.fileSize)
      };

      if (exp < now) {
        expired.push(formatted);
      } else if (exp <= sevenDaysFuture) {
        expiringIn7Days.push(formatted);
      } else {
        expiringIn30Days.push(formatted);
      }
    });

    return {
      expired,
      expiringIn7Days,
      expiringIn30Days,
      totalCount: docs.length
    };
  }
};
