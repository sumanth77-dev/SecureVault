import { api } from './api';

export const documentService = {
  async getDocuments(params = {}) {
    const res = await api.get('/documents', params);
    return res;
  },

  async getDocumentById(id) {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },

  async uploadDocument({ file, name, category, folderId, description, expiryDate }) {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (category) formData.append('category', category);
    if (folderId && folderId !== 'all') formData.append('folderId', folderId);
    if (description) formData.append('description', description);
    if (expiryDate) formData.append('expiryDate', expiryDate);

    const res = await api.post('/documents', formData);
    return res.data;
  },

  async uploadVersion(id, { file, notes }) {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) formData.append('notes', notes);

    const res = await api.post(`/documents/${id}/versions`, formData);
    return res.data;
  },

  async updateDocument(id, updateData) {
    const res = await api.put(`/documents/${id}`, updateData);
    return res.data;
  },

  async deleteDocument(id) {
    const res = await api.delete(`/documents/${id}`);
    return res;
  },

  async getDownloadUrl(id) {
    const res = await api.get(`/documents/${id}/download`);
    return res.data;
  },

  async getPreviewUrl(id) {
    const res = await api.get(`/documents/${id}/preview`);
    return res.data;
  },

  async getExpiringDocuments() {
    const res = await api.get('/documents/expiring');
    return res.data;
  }
};
