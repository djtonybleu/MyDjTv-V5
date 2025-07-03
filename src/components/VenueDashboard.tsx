import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, Target, BarChart3, Users, Play, 
  Settings, Palette, Calendar, TrendingUp,
  Eye, Edit, Trash2, Plus
} from 'lucide-react';

interface Commercial {
  id: string;
  title: string;
  duration: number;
  views: number;
  clicks: number;
  status: 'active' | 'paused';
  thumbnail: string;
}

export const VenueDashboard: React.FC = () => {
  const { venueId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [commercials] = useState<Commercial[]>([
    {
      id: '1',
      title: 'Promoción Especial - Descuento 20%',
      duration: 15,
      views: 1234,
      clicks: 89,
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Nuevo Menú de Temporada',
      duration: 20,
      views: 856,
      clicks: 67,
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Happy Hour - Bebidas 2x1',
      duration: 12,
      views: 2341,
      clicks: 156,
      status: 'paused',
      thumbnail: 'https://images.pexels.com/photos/544961/pexels-photo-544961.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    }
  ]);

  const venueData = {
    name: 'Café Central',
    type: 'Restaurant',
    subscribers: 45,
    monthlyRevenue: 405,
    totalViews: 4431,
    conversionRate: 7.2,
    logo: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'commercials', label: 'Comerciales', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={venueData.logo}
                alt={venueData.name}
                className="w-16 h-16 rounded-xl border-2 border-white/20"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">{venueData.name}</h1>
                <p className="text-gray-300">{venueData.type} • Panel de Control</p>
              </div>
              <div className="ml-4">
                <img 
                  src="/Mydjtv.jpg" 
                  alt="MyDJTV Logo"
                  className="w-8 h-8 object-contain opacity-60"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                {venueData.subscribers} Suscriptores Activos
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <nav className="w-64 p-6 border-r border-white/10">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Ingresos Mensuales',
                      value: `$${venueData.monthlyRevenue}`,
                      change: '+12.5%',
                      icon: TrendingUp,
                      color: 'from-green-500 to-emerald-500'
                    },
                    {
                      title: 'Suscriptores',
                      value: venueData.subscribers.toString(),
                      change: '+8.2%',
                      icon: Users,
                      color: 'from-blue-500 to-cyan-500'
                    },
                    {
                      title: 'Visualizaciones',
                      value: venueData.totalViews.toLocaleString(),
                      change: '+15.3%',
                      icon: Eye,
                      color: 'from-cyan-500 to-blue-500'
                    },
                    {
                      title: 'Conversión',
                      value: `${venueData.conversionRate}%`,
                      change: '+2.1%',
                      icon: Target,
                      color: 'from-blue-600 to-cyan-600'
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                      <p className="text-gray-300 text-sm">{stat.title}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 cursor-pointer"
                  >
                    <Target className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Crear Comercial</h3>
                    <p className="text-white/80">Diseña y programa tu próxima campaña publicitaria</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 cursor-pointer"
                  >
                    <BarChart3 className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Ver Analytics</h3>
                    <p className="text-white/80">Analiza el rendimiento de tus campañas</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 cursor-pointer"
                  >
                    <Palette className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Personalizar</h3>
                    <p className="text-white/80">Ajusta colores, logo y branding</p>
                  </motion.div>
                </div>

                {/* Recent Performance */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Rendimiento Reciente</h3>
                  <div className="space-y-4">
                    {commercials.slice(0, 3).map((commercial) => (
                      <div key={commercial.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <img
                            src={commercial.thumbnail}
                            alt={commercial.title}
                            className="w-12 h-12 rounded-lg"
                          />
                          <div>
                            <h4 className="text-white font-medium">{commercial.title}</h4>
                            <p className="text-gray-300 text-sm">{commercial.duration}s • {commercial.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{commercial.views} vistas</p>
                          <p className="text-green-400 text-sm">{commercial.clicks} clics</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'commercials' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Gestión de Comerciales</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Comercial</span>
                  </motion.button>
                </div>

                <div className="grid gap-6">
                  {commercials.map((commercial) => (
                    <motion.div
                      key={commercial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={commercial.thumbnail}
                            alt={commercial.title}
                            className="w-20 h-20 rounded-xl border-2 border-white/20"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-white">{commercial.title}</h3>
                            <p className="text-gray-300">Duración: {commercial.duration} segundos</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-300">
                                {commercial.views} visualizaciones
                              </span>
                              <span className="text-sm text-green-400">
                                {commercial.clicks} clics
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                commercial.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {commercial.status === 'active' ? 'Activo' : 'Pausado'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                          >
                            <Play className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                          >
                            <Edit className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-white">{commercial.views}</p>
                          <p className="text-gray-300 text-sm">Visualizaciones</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-green-400">{commercial.clicks}</p>
                          <p className="text-gray-300 text-sm">Clics</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-blue-400">
                            {((commercial.clicks / commercial.views) * 100).toFixed(1)}%
                          </p>
                          <p className="text-gray-300 text-sm">CTR</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'branding' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Personalización de Marca</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Logo y Colores</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Logo Actual
                        </label>
                        <div className="flex items-center space-x-4">
                          <img
                            src={venueData.logo}
                            alt="Logo actual"
                            className="w-16 h-16 rounded-xl border-2 border-white/20"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30"
                          >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Cambiar Logo
                          </motion.button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Color Primario
                        </label>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg border-2 border-white/20"></div>
                          <input
                            type="color"
                            value="#0EA5E9"
                            className="w-12 h-12 rounded-lg border-2 border-white/20 bg-transparent"
                          />
                          <span className="text-white font-mono">#0EA5E9</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Color Secundario
                        </label>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-cyan-500 rounded-lg border-2 border-white/20"></div>
                          <input
                            type="color"
                            value="#06B6D4"
                            className="w-12 h-12 rounded-lg border-2 border-white/20 bg-transparent"
                          />
                          <span className="text-white font-mono">#06B6D4</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Vista Previa</h3>
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-center">
                      <img
                        src={venueData.logo}
                        alt="Preview"
                        className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-white"
                      />
                      <h4 className="text-xl font-bold text-white mb-2">{venueData.name}</h4>
                      <p className="text-white/80">Experiencia Musical Interactiva</p>
                      <div className="mt-4 bg-white/20 rounded-lg p-3">
                        <p className="text-white text-sm">Así se verá tu marca en el player</p>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-medium"
                >
                  Guardar Cambios
                </motion.button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};