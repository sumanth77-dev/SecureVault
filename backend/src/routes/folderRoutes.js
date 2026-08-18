import { Router } from 'express';
import { folderController } from '../controllers/folderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', folderController.getFolders);
router.post('/', folderController.createFolder);
router.get('/:id', folderController.getFolderById);
router.put('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

export default router;
