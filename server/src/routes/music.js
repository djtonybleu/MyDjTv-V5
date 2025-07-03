import express from 'express';
import { 
  searchTracks, 
  getTrack, 
  createPlaylist, 
  getPlaylists, 
  updatePlaylist 
} from '../controllers/musicController.js';
import { protect, requireSubscription } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/search', requireSubscription, searchTracks);
router.get('/tracks/:id', getTrack);

router.route('/playlists')
  .get(getPlaylists)
  .post(createPlaylist);

router.put('/playlists/:id', updatePlaylist);

export default router;