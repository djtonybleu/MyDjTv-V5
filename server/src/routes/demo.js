import express from 'express';

const router = express.Router();

// Demo tracks for testing without Spotify
const demoTracks = [
  {
    id: 'demo1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    popularity: 95
  },
  {
    id: 'demo2',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    thumbnail: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    popularity: 88
  },
  {
    id: 'demo3',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration: 178,
    thumbnail: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    popularity: 92
  }
];

router.get('/tracks', (req, res) => {
  const { q } = req.query;
  let tracks = demoTracks;
  
  if (q) {
    tracks = demoTracks.filter(track => 
      track.title.toLowerCase().includes(q.toLowerCase()) ||
      track.artist.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  res.json({ success: true, tracks });
});

export default router;