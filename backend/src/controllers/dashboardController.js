import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  async getDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDashboardMetrics(req.user.id);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
};
