import { api } from './api';

export const authService = {
  async register({ name, email, password, phone }) {
    const res = await api.post('/auth/register', { name, email, password, phone });
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async loginWithGoogle(googleData = {}) {
    const res = await api.post('/auth/google', googleData);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network failure on logout
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data?.user;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res;
  },

  async resetPassword(token, newPassword) {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res;
  }
};
