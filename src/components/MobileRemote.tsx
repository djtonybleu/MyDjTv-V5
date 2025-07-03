import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Heart, Plus, Search, List, Shuffle, Repeat, 
  Home, Music, User, Settings, Crown
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  liked: boolean;
}

export const MobileRemote: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('player');
  const [isSubscribed, setIsSubscribed] = useState(true);

  // Simulated tracks
  const tracks: Track[] = [
    {
      id: "1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      duration: 200,
      thumbnail: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      liked: true
    },
    {
      id: "2",
      title: "Levitating",
      artist: "Dua Lipa",
      duration: 203,
      thumbnail: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      liked: false
    },
    {
      id: "3",
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      duration: 178,
      thumbnail: "https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      liked: true
    }
  ];

  useEffect(() => {
    setCurrentTrack(tracks[0]);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleLike = (trackId: string) => {
    setCurrentTrack(prev => 
      prev && prev.id === trackId 
        ? { ...prev, liked: !prev.liked }
        : prev
    );
  };

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center max-w-sm w-full border border-white/20"
        >
          <div className="mb-6">
            <img 
              src="/Mydjtv.jpg" 
              alt="MyDJTV Logo"
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
            <Crown className="w-16 h-16 text-yellow-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Control Premium</h2>
          <p className="text-gray-300 mb-6">
            Accede al control remoto completo y disfruta de la experiencia musical definitiva
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSubscribed(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg"
          >
            Suscribirse - $9.99/mes
          </motion.button>
          <p className="text-gray-400 text-sm mt-4">
            Control total estilo Spotify • Sin anuncios • Playlists ilimitadas
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-sm mx-auto bg-black/20 backdrop-blur-sm min-h-screen">
        {/* Header */}
        <div className="p-6 text-center border-b border-white/10">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <img 
              src="/Mydjtv.jpg" 
              alt="MyDJTV Logo"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-2xl font-bold text-white">MyDJTV Remote</h1>
          </div>
          <p className="text-gray-300 text-sm">Café Central</p>
          <div className="mt-2 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1 rounded-full">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-medium">PREMIUM</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'player' && currentTrack && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Album Art */}
              <div className="relative">
                <motion.img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full aspect-square rounded-3xl shadow-2xl"
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleLike(currentTrack.id)}
                  className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-full"
                >
                  <Heart 
                    className={`w-6 h-6 ${currentTrack.liked ? 'text-red-500 fill-current' : 'text-white'}`} 
                  />
                </motion.button>
              </div>

              {/* Track Info */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{currentTrack.title}</h2>
                <p className="text-lg text-gray-300">{currentTrack.artist}</p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="bg-white/20 rounded-full h-1">
                  <motion.div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full"
                    style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/10 rounded-full"
                >
                  <Shuffle className="w-6 h-6 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-4 bg-white/10 rounded-full"
                >
                  <SkipBack className="w-8 h-8 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-1" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-4 bg-white/10 rounded-full"
                >
                  <SkipForward className="w-8 h-8 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/10 rounded-full"
                >
                  <Repeat className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              {/* Volume */}
              <div className="flex items-center space-x-4 bg-white/5 rounded-2xl p-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </motion.button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-white text-sm w-8 text-right">
                  {isMuted ? 0 : volume}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-3"
                >
                  <Plus className="w-6 h-6 text-blue-400" />
                  <span className="text-white font-medium">Agregar a Lista</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('search')}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-3"
                >
                  <Search className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-medium">Buscar</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar canciones, artistas..."
                  className="w-full bg-white/10 backdrop-blur-sm rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                {tracks.map((track) => (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4 border border-white/10"
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{track.title}</h3>
                      <p className="text-gray-300 text-sm">{track.artist}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-blue-500 rounded-full"
                    >
                      <Play className="w-4 h-4 text-white" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-white/10 p-4">
          <div className="flex justify-around">
            {[
              { id: 'player', icon: Home, label: 'Player' },
              { id: 'search', icon: Search, label: 'Buscar' },
              { id: 'playlists', icon: List, label: 'Listas' },
              { id: 'profile', icon: User, label: 'Perfil' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-transparent'
                }`}
              >
                <tab.icon className="w-6 h-6 text-white" />
                <span className="text-xs text-white">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #0EA5E9, #06B6D4);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #0EA5E9, #06B6D4);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
        }
      `}</style>
    </div>
  );
};