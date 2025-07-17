import axios from 'axios';
import cache from '../config/cache.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

const getSpotifyToken = async () => {
  const cacheKey = cache.generateKey('spotify', 'token');
  
  // Try to get from cache first
  const cachedToken = await cache.get(cacheKey);
  if (cachedToken) {
    return cachedToken.access_token;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    const tokenData = {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in
    };
    
    // Cache token with 5 minutes buffer before expiry
    const ttl = tokenData.expires_in - 300;
    await cache.set(cacheKey, tokenData, ttl);
    
    logger.info('Spotify token refreshed and cached');
    return tokenData.access_token;
  } catch (error) {
    logger.error('Spotify token error:', error);
    throw new Error('Failed to get Spotify token');
  }
};

export const searchSpotify = async (query, limit = 20) => {
  const cacheKey = cache.generateKey('spotify', 'search', query, limit);
  
  // Try cache first (cache searches for 10 minutes)
  const cachedResult = await cache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const token = await getSpotifyToken();
    
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        q: query,
        type: 'track',
        limit,
        market: 'US'
      }
    });

    const results = response.data.tracks.items.map(track => ({
      id: `spotify:${track.id}`,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      thumbnail: track.album.images[0]?.url,
      spotifyId: track.id,
      popularity: track.popularity,
      explicit: track.explicit
    }));

    // Cache search results for 10 minutes
    await cache.set(cacheKey, results, 600);
    return results;
  } catch (error) {
    logger.error('Spotify search error:', error);
    return [];
  }
};

export const getSpotifyTrack = async (spotifyId) => {
  const trackId = spotifyId.replace('spotify:', '');
  const cacheKey = cache.generateKey('spotify', 'track', trackId);
  
  // Try cache first (cache tracks for 1 hour)
  const cachedTrack = await cache.get(cacheKey);
  if (cachedTrack) {
    return cachedTrack;
  }

  try {
    const token = await getSpotifyToken();
    
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const track = response.data;
    const trackData = {
      id: `spotify:${track.id}`,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      thumbnail: track.album.images[0]?.url,
      spotifyId: track.id,
      popularity: track.popularity,
      explicit: track.explicit
    };

    // Cache track data for 1 hour
    await cache.set(cacheKey, trackData, 3600);
    return trackData;
  } catch (error) {
    logger.error('Spotify track error:', error);
    return null;
  }
};