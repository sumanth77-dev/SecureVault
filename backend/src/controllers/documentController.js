import { z } from 'zod';
import { documentService } from '../services/documentService.js';
import { storageService } from '../services/storageService.js';

const updateDocSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  folderId: z.string().optional().nullable(),
  description: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  isStarred: z.boolean().optional()
});

export const documentController = {
  async getDocuments(req, res, next) {
    try {
      const { search, category, folderId, isStarred, sort, page, limit } = req.query;
      const result = await documentService.getDocuments(req.user.id, {
        search,
        category,
        folderId,
        isStarred,
        sort,
        page,
        limit
      });
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  async getExpiringDocuments(req, res, next) {
    try {
      const result = await documentService.getExpiringDocuments(req.user.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getDocumentById(req, res, next) {
    try {
      const document = await documentService.getDocumentById(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadDocument(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Browser';

      const result = await documentService.uploadDocument(req.user.id, {
        file: req.file,
        name: req.body.name,
        category: req.body.category,
        folderId: req.body.folderId,
        description: req.body.description,
        expiryDate: req.body.expiryDate,
        previewType: req.body.previewType,
        ipAddress,
        userAgent
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded and encrypted successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadVersion(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Browser';

      const result = await documentService.uploadVersion(req.user.id, req.params.id, {
        file: req.file,
        notes: req.body.notes,
        ipAddress,
        userAgent
      });

      res.status(201).json({
        success: true,
        message: 'New document version uploaded successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDocument(req, res, next) {
    try {
      const validated = updateDocSchema.parse(req.body);
      const updated = await documentService.updateDocument(req.user.id, req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Document updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Browser';

      const result = await documentService.deleteDocument(req.user.id, req.params.id, {
        ipAddress,
        userAgent
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  async getDownloadUrl(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Browser';

      const result = await documentService.getDownloadUrl(req.user.id, req.params.id, {
        ipAddress,
        userAgent
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getPreviewUrl(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Browser';

      const result = await documentService.getPreviewUrl(req.user.id, req.params.id, {
        ipAddress,
        userAgent
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fallback stream endpoint when running in local storage fallback mode
   */
  async streamFile(req, res, next) {
    try {
      const storageKey = decodeURIComponent(req.params.storageKey);
      const localFile = storageService.getLocalFile(storageKey);

      if (!localFile) {
        return res.status(404).send('File not found in local storage.');
      }

      res.setHeader('Content-Type', localFile.mimeType || 'application/octet-stream');
      if (req.query.download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${localFile.filename || 'download'}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${localFile.filename || 'preview'}"`);
      }

      res.send(localFile.buffer);
    } catch (error) {
      next(error);
    }
  }
};
