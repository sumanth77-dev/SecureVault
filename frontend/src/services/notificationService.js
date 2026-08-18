import { api } from './api';

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return {
      notifications: res.data || [],
      unreadCount: res.unreadCount || 0
    };
  },

  async markAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.put('/notifications/read-all');
    return res;
  },

  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res;
  },

  async clearAll() {
    const res = await api.delete('/notifications/clear-all');
    return res;
  }
};
