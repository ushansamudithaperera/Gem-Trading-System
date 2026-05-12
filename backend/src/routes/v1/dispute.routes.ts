import express from 'express';
import { openDispute, resolveDispute } from '../../controllers/dispute.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', openDispute);
router.put('/:disputeId/resolve', isAdmin, resolveDispute);

export default router;