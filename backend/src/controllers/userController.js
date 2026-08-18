import { z } from 'zod';
import { userService } from '../services/userService.js';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  twoFactorEnabled: z.boolean().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await userService.updateProfile(req.user.id, validated);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const validated = changePasswordSchema.parse(req.body);
      const result = await userService.changePassword(req.user.id, validated);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};
