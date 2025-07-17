import express from 'express';
import { 
  searchTracks, 
  getTrack, 
  createPlaylist, 
  getPlaylists, 
  updatePlaylist 
} from '../controllers/musicController.js';
import { protect, requireSubscription } from '../middleware/auth.js';
import { spotifyRateLimit, premiumBypass } from '../middleware/rateLimiting.js';
import { playlistsCache } from '../middleware/apiCache.js';

const router = express.Router();

router.use(protect);

router.get('/search', spotifyRateLimit, premiumBypass, searchTracks);
router.get('/tracks/:id', getTrack);

router.route('/playlists')
  .get(playlistsCache, getPlaylists)
  .post(createPlaylist);

router.put('/playlists/:id', updatePlaylist);

export default router;