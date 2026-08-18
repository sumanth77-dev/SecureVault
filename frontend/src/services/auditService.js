import { api } from './api';

export const auditService = {
  async getAuditLogs(params = {}) {
    const res = await api.get('/audit-logs', params);
    return res.data || [];
  }
};
