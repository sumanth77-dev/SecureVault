import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Google OAuth 2.0 Flow
router.get('/google', authController.initiateGoogleAuth);
router.get('/google/callback', authController.googleCallback);

router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticateToken, authController.getMe);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

export default router;
