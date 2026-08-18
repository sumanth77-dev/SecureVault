import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';
import { shareLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.get('/share/:token', publicController.getShareInfo);
router.post('/share/:token/unlock', shareLimiter, publicController.unlockShare);
router.get('/share/:token/download', publicController.downloadShare);
router.get('/share/:token/preview', publicController.previewShare);

export default router;
