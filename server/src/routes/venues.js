import express from 'express';
import { 
  createVenue, 
  getVenues, 
  getVenue, 
  updateVenue, 
  getVenueAnalytics 
} from '../controllers/venueController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVenues)
  .post(restrictTo('venue', 'admin'), createVenue);

router.route('/:id')
  .get(getVenue)
  .put(restrictTo('venue', 'admin'), updateVenue);

router.get('/:id/analytics', restrictTo('venue', 'admin'), getVenueAnalytics);

export default router;