import express from 'express';
import { getProfile, updateProfile, getAllUsers } from '../../controllers/user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = express.Router();

router.use(authMiddleware); // All user routes require auth

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/', isAdmin, getAllUsers);

export default router;