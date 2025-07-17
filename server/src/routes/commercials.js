import express from 'express';
import { 
  uploadCommercial, 
  getCommercials, 
  updateCommercial, 
  deleteCommercial 
} from '../controllers/commercialController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadRateLimit } from '../middleware/rateLimiting.js';
import { commercialsCache } from '../middleware/apiCache.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('venue', 'admin'));

router.route('/')
  .get(commercialsCache, getCommercials)
  .post(uploadRateLimit, uploadCommercial);

router.route('/:id')
  .put(updateCommercial)
  .delete(deleteCommercial);

export default router;