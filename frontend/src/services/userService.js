import { api } from './api';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/me');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/users/me', profileData);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.put('/users/me/password', { currentPassword, newPassword });
    return res;
  }
};
