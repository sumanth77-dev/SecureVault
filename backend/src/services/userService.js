import { db } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';

export const userService = {
  async getProfile(userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  },

  async updateProfile(userId, updateData) {
    const allowed = ['name', 'phone', 'avatarUrl', 'twoFactorEnabled'];
    const sanitized = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        sanitized[key] = updateData[key];
      }
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: sanitized,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await db.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_UPDATE',
        details: 'User profile settings updated'
      }
    });

    return updated;
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      const error = new Error('Current password does not match.');
      error.statusCode = 400;
      throw error;
    }

    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });

    await db.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGE',
        details: 'User updated their vault password'
      }
    });

    return { message: 'Password changed successfully.' };
  }
};
