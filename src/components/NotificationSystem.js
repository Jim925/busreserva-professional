import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const NotificationSystem = () => {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Solicitar permisos de notificación
    if ('Notification' in window && permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }

    // Registrar Service Worker para notificaciones push
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }, [permission]);

  const sendNotification = (title, options = {}) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  const scheduleNotification = (message, delay = 5000) => {
    setTimeout(() => {
      sendNotification('🚌 BusReserva', {
        body: message,
        tag: 'busreserva-notification'
      });
      toast.success(message);
    }, delay);
  };

  // Simular notificaciones automáticas
  useEffect(() => {
    const notifications = [
      'Tu autobús llegará en 15 minutos',
      'Nueva promoción: 20% descuento en viajes largos',
      'Recordatorio: Tu viaje es mañana a las 08:00',
      'El autobús BUS-123 está retrasado 10 minutos'
    ];

    const interval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      scheduleNotification(randomNotification);
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const testNotification = () => {
    sendNotification('🎉 Notificación de Prueba', {
      body: 'El sistema de notificaciones está funcionando correctamente!',
      requireInteraction: true
    });
    toast.success('Notificación enviada!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <strong>🔔 Notificaciones</strong>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '10px' }}>
        Estado: {permission === 'granted' ? '✅ Activadas' : '❌ Desactivadas'}
      </div>
      <button 
        onClick={testNotification}
        style={{
          background: '#667eea',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Probar Notificación
      </button>
    </motion.div>
  );
};

export default NotificationSystem;