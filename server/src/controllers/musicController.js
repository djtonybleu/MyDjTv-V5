import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';
import { searchSpotify, getSpotifyTrack } from '../services/spotifyService.js';

export const searchTracks = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    // Search in local database first
    const localTracks = await Track.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } }
      ]
    }).limit(parseInt(limit));

    // Search Spotify if needed
    let spotifyTracks = [];
    if (localTracks.length < limit) {
      spotifyTracks = await searchSpotify(q, limit - localTracks.length);
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
      venue: req.user.venue._id,
      tracks,
      genre,
      mood,
      timeOfDay
    });

    await playlist.populate('tracks');
    res.status(201).json({ success: true, playlist });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ venue: req.user.venue._id })
      .populate('tracks');
    
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tracks');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ success: true, playlist });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};