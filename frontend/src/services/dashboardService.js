import { api } from './api';

export const dashboardService = {
  async getDashboardMetrics() {
    const res = await api.get('/dashboard');
    return res.data;
  }
};

export const auditService = {
  async getAuditLogs(params = {}) {
    const res = await api.get('/audit-logs', params);
    return res.data || [];
  }
};
