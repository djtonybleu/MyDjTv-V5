import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap } from 'lucide-react';
import { createCheckoutSession } from '../services/stripe';

const plans = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    period: 'mes',
    description: 'Perfecto para probar el sistema',
    features: [
      'Hasta 10 canciones por día',
      'Reproductor básico',
      'Soporte por email',
      'Branding MyDJTV',
    ],
    limitations: [
      'Sin comerciales personalizados',
      'Sin analytics avanzados',
      'Sin push notifications',
    ],
    popular: false,
    priceId: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    period: 'mes',
    description: 'La solución completa para tu negocio',
    features: [
      'Música ilimitada',
      'Comerciales personalizados',
      'Analytics completos',
      'Push notifications',
      'Branding personalizado',
      'Soporte prioritario',
      'Control remoto premium',
    ],
    limitations: [],
    popular: true,
    priceId: 'price_premium_monthly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'mes',
    description: 'Para cadenas y grandes negocios',
    features: [
      'Todo lo de Premium',
      'Múltiples ubicaciones',
      'Dashboard centralizado',
      'Integración API',
      'Soporte dedicado',
      'Configuración personalizada',
      'Reportes avanzados',
    ],
    limitations: [],
    popular: false,
    priceId: 'price_enterprise_monthly',
  },
];

export const SubscriptionPlans: React.FC = () => {
  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return;
    
    try {
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="py-24 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Planes de Suscripción
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Elige el plan perfecto para tu negocio y comienza a generar ingresos con marketing musical
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border ${
                plan.popular 
                  ? 'border-blue-500 scale-105 shadow-2xl shadow-blue-500/20' 
                  : 'border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    Más Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 mb-4">{plan.description}</p>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-300 ml-2">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={!plan.priceId}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    : plan.priceId
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {plan.priceId ? (
                  <>
                    <Zap className="w-5 h-5 inline mr-2" />
                    Comenzar Ahora
                  </>
                ) : (
                  'Plan Actual'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            ¿Necesitas algo diferente? Contáctanos para un plan personalizado
          </p>
          <button className="bg-white/10 text-white px-6 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
            Hablar con Ventas
          </button>
        </div>
      </div>
    </div>
  );
};