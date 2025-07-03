import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';
import { searchSpotify, getSpotifyTrack } from '../services/spotifyService.js';

export const searchTracks = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    // Search in local database first
    const localTracks = await Track.search(q, parseInt(limit));

    // Use demo tracks if no Spotify credentials
    let spotifyTracks = [];
    if (localTracks.length < limit) {
      if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_ID !== 'demo_spotify_client_id') {
        spotifyTracks = await searchSpotify(q, limit - localTracks.length);
      } else {
        // Demo tracks fallback
        const demoTracks = [
          { id: 'demo1', title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
          { id: 'demo2', title: 'Levitating', artist: 'Dua Lipa', duration: 203, thumbnail: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
          { id: 'demo3', title: 'Good 4 U', artist: 'Olivia Rodrigo', duration: 178, thumbnail: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' }
        ];
        spotifyTracks = demoTracks.filter(track => 
          track.title.toLowerCase().includes(q.toLowerCase()) ||
          track.artist.toLowerCase().includes(q.toLowerCase())
        );
      }
    }

    res.json({
      success: true,
      tracks: [...localTracks, ...spotifyTracks]
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTrack = async (req, res) => {
  try {
    let track = await Track.findById(req.params.id);
    
    if (!track && req.params.id.startsWith('spotify:')) {
      track = await getSpotifyTrack(req.params.id);
    }

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    res.json({ success: true, track });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const { name, tracks, genre, mood, timeOfDay } = req.body;
    
    const playlist = await Playlist.create({
      name,
      venue_id: req.user.venue_id,
      genre
    });

    await playlist.populate('tracks');
    res.status(201).json({ success: true, playlist });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.findByVenueId(req.user.venue_id);
    
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.update(req.params.id, req.body);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ success: true, playlist });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};