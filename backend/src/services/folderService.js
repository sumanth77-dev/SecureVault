import { db } from '../config/database.js';

export const folderService = {
  async getFolders(userId) {
    const folders = await db.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { documents: true }
        },
        documents: {
          select: { fileSize: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return folders.map(f => {
      const totalSizeBytes = f.documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
      const sizeMB = parseFloat((totalSizeBytes / (1024 * 1024)).toFixed(1));
      return {
        id: f.id,
        name: f.name,
        slug: f.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        color: f.color,
        description: f.description,
        itemCount: f._count.documents,
        sizeMB,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt
      };
    });
  },

  async getFolderById(userId, folderId) {
    const folder = await db.folder.findFirst({
      where: { id: folderId, userId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { documents: true }
        }
      }
    });

    if (!folder) {
      const error = new Error('Folder not found or unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    const totalSizeBytes = folder.documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
    return {
      ...folder,
      itemCount: folder._count.documents,
      sizeMB: parseFloat((totalSizeBytes / (1024 * 1024)).toFixed(1))
    };
  },

  async createFolder(userId, { name, color = 'blue', description = '' }) {
    const folder = await db.folder.create({
      data: {
        userId,
        name: name.trim(),
        color,
        description: description?.trim() || null
      }
    });

    return {
      id: folder.id,
      name: folder.name,
      slug: folder.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      color: folder.color,
      description: folder.description,
      itemCount: 0,
      sizeMB: 0,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    };
  },

  async updateFolder(userId, folderId, { name, color, description }) {
    const existing = await db.folder.findFirst({
      where: { id: folderId, userId }
    });

    if (!existing) {
      const error = new Error('Folder not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await db.folder.update({
      where: { id: folderId },
      data: {
        name: name ? name.trim() : undefined,
        color: color !== undefined ? color : undefined,
        description: description !== undefined ? description : undefined
      }
    });

    return updated;
  },

  async deleteFolder(userId, folderId) {
    const existing = await db.folder.findFirst({
      where: { id: folderId, userId }
    });

    if (!existing) {
      const error = new Error('Folder not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    // Move associated documents to unassigned (folderId = null)
    await db.document.updateMany({
      where: { folderId, userId },
      data: { folderId: null }
    });

    await db.folder.delete({
      where: { id: folderId }
    });

    return { message: 'Folder deleted successfully. Associated documents moved to default.' };
  }
};
