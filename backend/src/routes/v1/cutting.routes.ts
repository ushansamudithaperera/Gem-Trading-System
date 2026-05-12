import express from 'express';
import { hireCutter, updateCuttingProgress } from '../../controllers/cutting.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isBuyer, isCutter } from '../../middleware/role.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/hire', isBuyer, hireCutter);
router.put('/:jobId/progress', isCutter, updateCuttingProgress);

export default router;