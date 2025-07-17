import express from 'express';
import { 
  createVenue, 
  getVenues, 
  getVenue, 
  updateVenue, 
  getVenueAnalytics 
} from '../controllers/venueController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { venueCache, analyticsCache } from '../middleware/apiCache.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(venueCache, getVenues)
  .post(restrictTo('venue', 'admin'), createVenue);

router.route('/:id')
  .get(venueCache, getVenue)
  .put(restrictTo('venue', 'admin'), updateVenue);

router.get('/:id/analytics', restrictTo('venue', 'admin'), analyticsCache, getVenueAnalytics);

export default router;