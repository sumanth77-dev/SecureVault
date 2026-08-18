import { api } from './api';

export const shareService = {
  // Private owner endpoints
  async createShare(shareData) {
    const res = await api.post('/shares', shareData);
    return res.data;
  },

  async getShares() {
    const res = await api.get('/shares');
    return res.data;
  },

  async revokeShare(id) {
    const res = await api.post(`/shares/${id}/revoke`);
    return res.data;
  },

  async deleteShare(id) {
    const res = await api.delete(`/shares/${id}`);
    return res;
  },

  // Public recipient endpoints
  async getPublicShare(token) {
    const res = await api.get(`/public/share/${token}`);
    return res.data;
  },

  async unlockPublicShare(token, password) {
    const res = await api.post(`/public/share/${token}/unlock`, { password });
    return res.data;
  },

  async getPublicDownloadUrl(token, unlockToken) {
    const headers = unlockToken ? { 'x-unlock-token': unlockToken } : {};
    const res = await api.get(`/public/share/${token}/download`, {}, headers);
    return res.data;
  },

  async getPublicPreviewUrl(token, unlockToken) {
    const headers = unlockToken ? { 'x-unlock-token': unlockToken } : {};
    const res = await api.get(`/public/share/${token}/preview`, {}, headers);
    return res.data;
  }
};
