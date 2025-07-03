import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Users, QrCode } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
}

interface Commercial {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  brand: string;
}

export const VenuePlayer: React.FC = () => {
  const { venueId } = useParams();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentCommercial, setCurrentCommercial] = useState<Commercial | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [connectedUsers, setConnectedUsers] = useState(12);
  const [showQR, setShowQR] = useState(false);

  // Simulated venue data
  const venueData = {
    name: "Café Central",
    logo: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    primaryColor: "#0EA5E9",
    secondaryColor: "#06B6D4"
  };

  // Simulated current track
  useEffect(() => {
    setCurrentTrack({
      id: "1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      duration: 200,
      thumbnail: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    });
  }, []);

  // Simulated commercial rotation
  useEffect(() => {
    const commercialInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to show commercial
        setCurrentCommercial({
          id: "ad1",
          title: "Promoción Especial - Café Central",
          duration: 15,
          thumbnail: venueData.logo,
          brand: venueData.name
        });
        
        setTimeout(() => {
          setCurrentCommercial(null);
        }, 15000);
      }
    }, 60000); // Check every minute

    return () => clearInterval(commercialInterval);
  }, []);

  // Progress simulation
  useEffect(() => {
    if (isPlaying && currentTrack) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= currentTrack.duration) {
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-30" />
            <div className="relative bg-white p-3 rounded-full shadow-2xl">
              <img 
                src="/Mydjtv.jpg" 
                alt="MyDJTV Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{venueData.name}</h1>
            <p className="text-gray-300">Powered by MyDJTV</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">{connectedUsers}</span>
            <span className="text-gray-300 text-sm">conectados</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQR(!showQR)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full shadow-lg"
          >
            <QrCode className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </header>

      {/* Main Player */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Commercial Overlay */}
          <AnimatePresence>
            {currentCommercial && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 rounded-2xl text-center max-w-md">
                  <img 
                    src={currentCommercial.thumbnail} 
                    alt={currentCommercial.brand}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white"
                  />
                  <h3 className="text-2xl font-bold text-white mb-2">{currentCommercial.title}</h3>
                  <p className="text-white/80">Publicidad - {currentCommercial.brand}</p>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <motion.div
                      className="bg-white h-full rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: currentCommercial.duration }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Now Playing */}
          {currentTrack && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
            >
              <div className="flex items-center space-x-8">
                <div className="relative">
                  <img 
                    src={currentTrack.thumbnail} 
                    alt={currentTrack.title}
                    className="w-32 h-32 rounded-2xl shadow-2xl"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{currentTrack.title}</h2>
                  <p className="text-xl text-gray-300 mb-6">{currentTrack.artist}</p>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="bg-white/20 rounded-full h-2">
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
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <SkipBack className="w-6 h-6 text-white" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <SkipForward className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Volume Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-4">
              <Volume2 className="w-6 h-6 text-white" />
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
              <span className="text-white font-semibold w-12 text-right">{volume}%</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <img 
                  src="/Mydjtv.jpg" 
                  alt="MyDJTV Logo"
                  className="w-32 h-32 object-contain mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-gray-800">Controla la Música</h3>
              </div>
              <div className="bg-gray-100 p-6 rounded-xl mb-4">
                <div className="w-48 h-48 bg-black mx-auto rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-white" />
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Escanea para descargar MyDJTV Remote y controlar la música desde tu celular
              </p>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-lg">
                <p className="font-semibold">Control Premium • $9.99/mes</p>
                <p className="text-sm opacity-90">Experiencia Spotify completa</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #0EA5E9, #06B6D4);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #0EA5E9, #06B6D4);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }
      `}</style>
    </div>
  );
};