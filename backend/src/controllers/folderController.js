import { z } from 'zod';
import { folderService } from '../services/folderService.js';

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(60),
  color: z.string().optional().default('blue'),
  description: z.string().optional()
});

const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(60).optional(),
  color: z.string().optional(),
  description: z.string().optional()
});

export const folderController = {
  async getFolders(req, res, next) {
    try {
      const folders = await folderService.getFolders(req.user.id);
      res.status(200).json({
        success: true,
        data: folders
      });
    } catch (error) {
      next(error);
    }
  },

  async getFolderById(req, res, next) {
    try {
      const folder = await folderService.getFolderById(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: folder
      });
    } catch (error) {
      next(error);
    }
  },

  async createFolder(req, res, next) {
    try {
      const validated = createFolderSchema.parse(req.body);
      const folder = await folderService.createFolder(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'Folder created successfully.',
        data: folder
      });
    } catch (error) {
      next(error);
    }
  },

  async updateFolder(req, res, next) {
    try {
      const validated = updateFolderSchema.parse(req.body);
      const updated = await folderService.updateFolder(req.user.id, req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Folder updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteFolder(req, res, next) {
    try {
      const result = await folderService.deleteFolder(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};
