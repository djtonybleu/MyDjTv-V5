import axios from 'axios';

let spotifyToken = null;
let tokenExpiry = null;

const getSpotifyToken = async () => {
  if (spotifyToken && tokenExpiry > Date.now()) {
    return spotifyToken;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    spotifyToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return spotifyToken;
  } catch (error) {
    console.error('Spotify token error:', error);
    throw new Error('Failed to get Spotify token');
  }
};

export const searchSpotify = async (query, limit = 20) => {
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

    return response.data.tracks.items.map(track => ({
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
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
};

export const getSpotifyTrack = async (spotifyId) => {
  try {
    const token = await getSpotifyToken();
    const trackId = spotifyId.replace('spotify:', '');
    
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const track = response.data;
    return {
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
  } catch (error) {
    console.error('Spotify track error:', error);
    return null;
  }
};