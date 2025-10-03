import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { API_CONFIG } from '../config/apis';

const RealTimeUpdates = () => {
  const [notifications, setNotifications] = useState([]);
  const [busLocations, setBusLocations] = useState({});
  const [socket, setSocket] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const newSocket = io(API_CONFIG.SOCKET_URL);
    setSocket(newSocket);

    // Escuchar actualizaciones en tiempo real
    newSocket.on('busLocationUpdate', (data) => {
      setBusLocations(prev => ({
        ...prev,
        [data.busId]: data.location
      }));
      
      toast.success(`🚌 Autobús ${data.busId} actualizado`, {
        duration: 3000,
        position: 'top-right'
      });
    });

    newSocket.on('reservationUpdate', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'reservation',
        message: `Nueva reserva: ${data.route}`,
        timestamp: new Date()
      }]);
      
      toast.success('🎫 Nueva reserva confirmada!');
    });

    newSocket.on('busDelayAlert', (data) => {
      toast.error(`⚠️ Retraso: Autobús ${data.busId} - ${data.delay} min`, {
        duration: 5000
      });
    });

    // Simular actualizaciones cada 10 segundos
    const interval = setInterval(() => {
      const mockUpdate = {
        busId: `BUS-${Math.floor(Math.random() * 100)}`,
        location: {
          lat: 40.4168 + (Math.random() - 0.5) * 0.1,
          lng: -3.7038 + (Math.random() - 0.5) * 0.1
        },
        speed: Math.floor(Math.random() * 80) + 20,
        passengers: Math.floor(Math.random() * 40) + 5
      };
      
      newSocket.emit('busLocationUpdate', mockUpdate);
    }, 10000);

    // Actualizar hora cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
      newSocket.close();
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <>
      <Toaster />
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                marginBottom: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>🔔 Notificaciones</h4>
                <button 
                  onClick={clearNotifications}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              {notifications.slice(-3).map(notification => (
                <div key={notification.id} style={{
                  padding: '8px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '5px',
                  fontSize: '14px'
                }}>
                  {notification.message}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget de estado minimalista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#1d1d1f',
            borderRadius: '18px',
            padding: '20px',
            marginTop: '20px',
            minWidth: '200px'
          }}
        >
          <h4 className="headline" style={{ margin: '0 0 12px 0', color: '#f5f5f7' }}>Estado en vivo</h4>
          <div className="body" style={{ color: '#a1a1a6', marginBottom: '8px' }}>
            {Object.keys(busLocations).length} autobuses activos
          </div>
          <div className="caption" style={{ color: '#86868b', marginBottom: '4px' }}>
            Última actualización: {new Date().toLocaleTimeString()}
          </div>
          <div className="caption" style={{ color: '#0071e3' }}>
            {currentTime.toLocaleTimeString()}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RealTimeUpdates;