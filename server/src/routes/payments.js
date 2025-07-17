import express from 'express';
import { createSubscription, handleWebhook } from '../services/stripeService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-subscription', protect, async (req, res) => {
  try {
    const { priceId } = req.body;
    const result = await createSubscription(req.user.id, priceId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;