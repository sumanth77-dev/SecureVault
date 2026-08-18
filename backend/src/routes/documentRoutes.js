import { Router } from 'express';
import { documentController } from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { handleUpload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Stream fallback endpoint (for local preview/download without Supabase remote)
router.get('/stream/:storageKey', documentController.streamFile);

// Protected routes
router.use(authenticateToken);

router.get('/', documentController.getDocuments);
router.post('/', handleUpload, documentController.uploadDocument);
router.post('/:id/versions', handleUpload, documentController.uploadVersion);
router.get('/expiring', documentController.getExpiringDocuments);
router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/download', documentController.getDownloadUrl);
router.get('/:id/preview', documentController.getPreviewUrl);

export default router;
