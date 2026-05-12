import express from 'express';
import { courierDeliveredWebhook, stripeWebhook } from '../../controllers/webhook.controller';

const router = express.Router();

// Public webhooks (no auth needed, but should verify signatures in production)
router.post('/courier/delivered', express.json(), courierDeliveredWebhook);
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;