import prisma from '../config/prisma.js';
import { searchSpotify, getSpotifyTrack } from '../services/spotifyService.js';

export const searchTracks = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    // Search in local database first
    const localTracks = await prisma.track.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { artist: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: parseInt(limit)
    });

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
    let track = await prisma.track.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
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
    const { name, tracks, genre } = req.body;
    
    const playlist = await prisma.playlist.create({
      data: {
        name,
        venueId: req.user.venueId,
        genre
      }
    });

    // Add tracks to playlist if provided
    if (tracks && tracks.length > 0) {
      const playlistTracks = tracks.map((trackId, index) => ({
        playlistId: playlist.id,
        trackId: parseInt(trackId),
        position: index
      }));

      await prisma.playlistTrack.createMany({
        data: playlistTracks
      });
    }

    const playlistWithTracks = await prisma.playlist.findUnique({
      where: { id: playlist.id },
      include: {
        tracks: {
          include: {
            track: true
          }
        }
      }
    });

    res.status(201).json({ success: true, playlist: playlistWithTracks });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { venueId: req.user.venueId },
      include: {
        tracks: {
          include: {
            track: true
          }
        }
      }
    });
    
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { name, genre, tracks } = req.body;
    
    const playlist = await prisma.playlist.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        genre
      }
    });

    // Update tracks if provided
    if (tracks) {
      // Remove existing tracks
      await prisma.playlistTrack.deleteMany({
        where: { playlistId: parseInt(req.params.id) }
      });

      // Add new tracks
      const playlistTracks = tracks.map((trackId, index) => ({
        playlistId: parseInt(req.params.id),
        trackId: parseInt(trackId),
        position: index
      }));

      await prisma.playlistTrack.createMany({
        data: playlistTracks
      });
    }

    const updatedPlaylist = await prisma.playlist.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tracks: {
          include: {
            track: true
          }
        }
      }
    });

    res.json({ success: true, playlist: updatedPlaylist });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};