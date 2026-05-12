import express from 'express';
import { createOrder, cancelOrder, getUserOrders } from '../../controllers/order.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isBuyer } from '../../middleware/role.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', isBuyer, createOrder);
router.get('/', getUserOrders);
router.put('/:orderId/cancel', isBuyer, cancelOrder);

export default router;