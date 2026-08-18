import { auditService } from '../services/auditService.js';

export const auditController = {
  async getAuditLogs(req, res, next) {
    try {
      const { limit, action } = req.query;
      const logs = await auditService.getAuditLogs(req.user.id, { limit, action });
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
};
