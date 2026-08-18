import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', dashboardController.getDashboard);

export default router;
