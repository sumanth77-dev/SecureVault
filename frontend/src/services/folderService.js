import { api } from './api';

export const folderService = {
  async getFolders() {
    const res = await api.get('/folders');
    return res.data;
  },

  async getFolderById(id) {
    const res = await api.get(`/folders/${id}`);
    return res.data;
  },

  async createFolder({ name, color, description }) {
    const res = await api.post('/folders', { name, color, description });
    return res.data;
  },

  async updateFolder(id, { name, color, description }) {
    const res = await api.put(`/folders/${id}`, { name, color, description });
    return res.data;
  },

  async deleteFolder(id) {
    const res = await api.delete(`/folders/${id}`);
    return res;
  }
};
