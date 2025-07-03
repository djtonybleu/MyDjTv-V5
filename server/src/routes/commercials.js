import express from 'express';
import { 
  uploadCommercial, 
  getCommercials, 
  updateCommercial, 
  deleteCommercial 
} from '../controllers/commercialController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('venue', 'admin'));

router.route('/')
  .get(getCommercials)
  .post(uploadCommercial);

router.route('/:id')
  .put(updateCommercial)
  .delete(deleteCommercial);

export default router;