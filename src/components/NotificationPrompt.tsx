import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { notificationService } from '../services/notifications';

export const NotificationPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const subscribed = await notificationService.isSubscribed();
      setIsSubscribed(subscribed);
      
      // Show prompt if not subscribed and permission is default
      if (!subscribed && Notification.permission === 'default') {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const permission = await notificationService.requestPermission();
      
      if (permission === 'granted') {
        await notificationService.subscribeToPush();
        setIsSubscribed(true);
        setShowPrompt(false);
        
        // Show success notification
        await notificationService.sendNotification({
          title: '🎵 MyDJTV Notificaciones',
          message: 'Te notificaremos sobre nuevas canciones y ofertas especiales',
        });
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (isSubscribed || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl shadow-2xl border border-white/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Bell className="w-6 h-6 mr-3" />
              <h3 className="font-semibold">¡Mantente al día!</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-white/90 mb-4">
            Recibe notificaciones sobre nuevas canciones, ofertas especiales y actualizaciones de tu música favorita.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Permitir
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};