import { Router } from 'express';
import { shareController } from '../controllers/shareController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', shareController.createShare);
router.get('/', shareController.getShares);
router.post('/:id/revoke', shareController.revokeShare);
router.delete('/:id', shareController.deleteShare);

export default router;
