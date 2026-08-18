import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.put('/me/password', userController.changePassword);

export default router;
