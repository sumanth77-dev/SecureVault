import { z } from 'zod';
import { shareService } from '../services/shareService.js';

const createShareSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  sharedWith: z.string().optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  expiryOption: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
  hasPassword: z.boolean().optional(),
  password: z.string().optional(),
  allowDownload: z.boolean().optional(),
  maxDownloads: z.number().int().positive().optional().nullable()
});

export const shareController = {
  async createShare(req, res, next) {
    try {
      const validated = createShareSchema.parse(req.body);
      const result = await shareService.createShareLink(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'Secure share link generated.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getShares(req, res, next) {
    try {
      const shares = await shareService.getShares(req.user.id);
      res.status(200).json({
        success: true,
        data: shares
      });
    } catch (error) {
      next(error);
    }
  },

  async revokeShare(req, res, next) {
    try {
      const result = await shareService.revokeShare(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Share link revoked successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteShare(req, res, next) {
    try {
      const result = await shareService.deleteShare(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};
