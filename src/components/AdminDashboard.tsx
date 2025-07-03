import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Music, TrendingUp, Settings, 
  Plus, Edit, Trash2, Eye, BarChart3, DollarSign,
  Play, Pause, Upload, Target
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  type: string;
  location: string;
  subscribers: number;
  revenue: number;
  status: 'active' | 'inactive';
  logo: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  venue: string;
  subscription: 'active' | 'expired';
  joinDate: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [venues] = useState<Venue[]>([
    {
      id: '1',
      name: 'Café Central',
      type: 'Restaurant',
      location: 'Downtown',
      subscribers: 45,
      revenue: 405,
      status: 'active',
      logo: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Fitness Pro Gym',
      type: 'Gym',
      location: 'North Side',
      subscribers: 78,
      revenue: 702,
      status: 'active',
      logo: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      name: 'Hotel Luxury',
      type: 'Hotel',
      location: 'City Center',
      subscribers: 23,
      revenue: 207,
      status: 'inactive',
      logo: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ]);

  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@email.com',
      venue: 'Café Central',
      subscription: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria@email.com',
      venue: 'Fitness Pro Gym',
      subscription: 'active',
      joinDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'Carlos López',
      email: 'carlos@email.com',
      venue: 'Hotel Luxury',
      subscription: 'expired',
      joinDate: '2024-01-10'
    }
  ]);

  const totalRevenue = venues.reduce((sum, venue) => sum + venue.revenue, 0);
  const totalSubscribers = venues.reduce((sum, venue) => sum + venue.subscribers, 0);
  const activeVenues = venues.filter(v => v.status === 'active').length;

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'venues', label: 'Sucursales', icon: Building2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'content', label: 'Contenido', icon: Music },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-30" />
                <div className="relative bg-white p-3 rounded-full shadow-2xl">
                  <img 
                    src="/Mydjtv.jpg" 
                    alt="MyDJTV Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                <p className="text-gray-300">MyDJTV Marketing Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                Sistema Activo
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
                      title: 'Ingresos Totales',
                      value: `$${totalRevenue.toLocaleString()}`,
                      change: '+12.5%',
                      icon: DollarSign,
                      color: 'from-green-500 to-emerald-500'
                    },
                    {
                      title: 'Suscriptores',
                      value: totalSubscribers.toString(),
                      change: '+8.2%',
                      icon: Users,
                      color: 'from-blue-500 to-cyan-500'
                    },
                    {
                      title: 'Sucursales Activas',
                      value: activeVenues.toString(),
                      change: '+2',
                      icon: Building2,
                      color: 'from-cyan-500 to-blue-500'
                    },
                    {
                      title: 'Reproducciones',
                      value: '12.4K',
                      change: '+15.3%',
                      icon: Play,
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

                {/* Recent Activity */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'Nueva suscripción', venue: 'Café Central', time: '5 min ago', type: 'success' },
                      { action: 'Comercial subido', venue: 'Fitness Pro Gym', time: '12 min ago', type: 'info' },
                      { action: 'Usuario desconectado', venue: 'Hotel Luxury', time: '25 min ago', type: 'warning' },
                      { action: 'Playlist creada', venue: 'Café Central', time: '1 hora ago', type: 'info' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-400' :
                          activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.action}</p>
                          <p className="text-gray-300 text-sm">{activity.venue}</p>
                        </div>
                        <span className="text-gray-400 text-sm">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'venues' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Gestión de Sucursales</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nueva Sucursal</span>
                  </motion.button>
                </div>

                <div className="grid gap-6">
                  {venues.map((venue) => (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={venue.logo}
                            alt={venue.name}
                            className="w-16 h-16 rounded-xl border-2 border-white/20"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                            <p className="text-gray-300">{venue.type} • {venue.location}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-300">
                                {venue.subscribers} suscriptores
                              </span>
                              <span className="text-sm text-green-400">
                                ${venue.revenue}/mes
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                venue.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {venue.status === 'active' ? 'Activo' : 'Inactivo'}
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
                            <Eye className="w-5 h-5" />
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
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'content' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Gestión de Contenido</h2>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Subir Música</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                    >
                      <Target className="w-5 h-5" />
                      <span>Crear Comercial</span>
                    </motion.button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Biblioteca Musical</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Pop Hits 2024', tracks: 45, plays: '2.3K' },
                        { title: 'Rock Classics', tracks: 78, plays: '1.8K' },
                        { title: 'Electronic Vibes', tracks: 32, plays: '1.2K' },
                        { title: 'Latin Rhythms', tracks: 56, plays: '3.1K' }
                      ].map((playlist, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div>
                            <h4 className="text-white font-medium">{playlist.title}</h4>
                            <p className="text-gray-300 text-sm">{playlist.tracks} canciones</p>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-400 font-medium">{playlist.plays}</p>
                            <p className="text-gray-400 text-sm">reproducciones</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Comerciales Activos</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Promoción Café Central', venue: 'Café Central', views: '456' },
                        { title: 'Membresía Gym Pro', venue: 'Fitness Pro Gym', views: '789' },
                        { title: 'Suite Premium Hotel', venue: 'Hotel Luxury', views: '234' }
                      ].map((ad, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div>
                            <h4 className="text-white font-medium">{ad.title}</h4>
                            <p className="text-gray-300 text-sm">{ad.venue}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-medium">{ad.views}</p>
                            <p className="text-gray-400 text-sm">visualizaciones</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};