import React from 'react';
import { motion } from 'framer-motion';
import { Music, Smartphone, TrendingUp, Users, Play, Zap, LogIn, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-white p-8 rounded-full shadow-2xl">
                  <img 
                    src="/Mydjtv.jpg" 
                    alt="MyDJTV Logo" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              My<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">DJ</span>TV
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revoluciona tu negocio con la primera plataforma de marketing musical interactivo. 
              Tus clientes controlan el ambiente mientras promocionas tu marca.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/remote">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Smartphone className="w-5 h-5 inline mr-2" />
                  Probar Control Remoto
                </motion.button>
              </Link>
              
              <Link to="/admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <LogIn className="w-5 h-5 inline mr-2" />
                  Acceso Empresarial
                </motion.button>
              </Link>
            </div>

            {/* Call to Action Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <p className="text-blue-300 font-medium">
                🚀 Comienza tu experiencia de marketing musical en 3 pasos
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Cómo Funciona la Magia?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tres simples pasos para transformar tu negocio en una experiencia musical interactiva
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Instala el Player",
                description: "Configura el reproductor web en tu negocio con tu logo y branding personalizado",
                icon: Play,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02", 
                title: "Clientes se Conectan",
                description: "Tus clientes escanean el QR, se suscriben y controlan la música desde su celular",
                icon: Smartphone,
                color: "from-cyan-500 to-blue-500"
              },
              {
                step: "03",
                title: "Marketing Automático",
                description: "Tus comerciales se reproducen entre canciones generando engagement y ventas",
                icon: Target,
                color: "from-blue-600 to-cyan-600"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group relative"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 h-full">
                  <div className="text-center">
                    <div className={`bg-gradient-to-r ${step.color} p-4 rounded-xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className={`text-6xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4`}>
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Experiencia de Marketing Musical
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Convierte tu negocio en un espacio interactivo donde cada cliente puede personalizar su experiencia
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Control Remoto Premium",
                description: "Tus clientes controlan la música como en Spotify desde su celular",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Target,
                title: "Publicidad Inteligente",
                description: "Inserta comerciales de tu marca entre canciones para máximo impacto",
                color: "from-cyan-500 to-blue-500"
              },
              {
                icon: TrendingUp,
                title: "Analytics en Tiempo Real",
                description: "Métricas detalladas de engagement y efectividad publicitaria",
                color: "from-blue-600 to-cyan-600"
              },
              {
                icon: Users,
                title: "Branding Total",
                description: "Logo, colores y experiencia 100% personalizada para tu negocio",
                color: "from-cyan-600 to-blue-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 h-full">
                  <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Cases */}
      <section className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Casos de Éxito Comerciales
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transforma cualquier espacio en una experiencia musical interactiva y rentable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "🍕 Restaurantes & Cafés",
                features: [
                  "Clientes controlan ambiente desde su mesa",
                  "Promociones de platos entre canciones",
                  "Playlists personalizadas por horario",
                  "Engagement durante esperas"
                ]
              },
              {
                title: "🏋️ Gimnasios & Spas",
                features: [
                  "Música motivacional controlada por usuarios",
                  "Promociones de servicios y productos",
                  "Playlists por tipo de actividad",
                  "Experiencia premium para miembros"
                ]
              },
              {
                title: "🏨 Hoteles & Bares",
                features: [
                  "Huéspedes VIP controlan ambiente",
                  "Promociones de servicios del hotel",
                  "Música personalizada por zona",
                  "Experiencia diferenciada"
                ]
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-6">{useCase.title}</h3>
                <ul className="space-y-3">
                  {useCase.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-300">
                      <Zap className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para Revolucionar tu Negocio?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a la nueva era del marketing musical interactivo y convierte cada visita en una experiencia memorable
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/venue/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  Ver Demo en Vivo
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Users className="w-5 h-5 inline mr-2" />
                Solicitar Consultoría
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Sistema en Vivo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Soporte 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span>Setup en 24hrs</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};