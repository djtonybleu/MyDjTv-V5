import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Music, Wifi, WifiOff } from 'lucide-react';

// Simple components for now
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
    <div className="text-center text-white">
      <Music size={64} className="mx-auto mb-6 text-blue-400" />
      <h1 className="text-5xl font-bold mb-4">MyDJTV</h1>
      <p className="text-xl mb-8">Marketing Musical Interactivo</p>
      <div className="space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors">
          Iniciar Sesión
        </button>
        <button className="border border-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors">
          Registrarse
        </button>
      </div>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  </div>
);

const AdminPage = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Venues</h3>
          <p className="text-3xl font-bold text-green-600">56</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">$12,345</p>
        </div>
      </div>
    </div>
  </div>
);

const RemotePage = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(50);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Control Remoto</h1>
          <div className="flex items-center justify-center space-x-2">
            {isConnected ? (
              <>
                <Wifi size={16} className="text-green-400" />
                <span className="text-green-400">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-400" />
                <span className="text-red-400">Desconectado</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <div className="w-32 h-32 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Music size={48} className="text-gray-400" />
            </div>
            <h3 className="font-semibold">No hay música reproduciendo</h3>
            <p className="text-gray-400">Selecciona una canción</p>
          </div>

          <div className="flex justify-center space-x-4 mb-4">
            <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
              ⏮
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>
            <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
              ⏭
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-8">{volume}%</span>
          </div>
        </div>

        <button
          onClick={() => setIsConnected(!isConnected)}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            isConnected
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isConnected ? 'Desconectar' : 'Conectar al Venue'}
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/remote" element={<RemotePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;