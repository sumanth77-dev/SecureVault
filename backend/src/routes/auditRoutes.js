import { Router } from 'express';
import { auditController } from '../controllers/auditController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', auditController.getAuditLogs);

export default router;
