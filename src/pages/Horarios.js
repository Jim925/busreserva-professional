import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { busService } from '../services/api';
import toast from 'react-hot-toast';

const Horarios = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await busService.getRoutes();
      setRoutes(data);
    } catch (error) {
      toast.error('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = (route) => {
    toast.success(`Redirigiendo a reserva para ${route.origin} - ${route.destination}`);
  };

  return (
    <section className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 className="title-1" style={{ marginBottom: '16px' }}>
            Horarios
          </h1>
          <p className="body">
            Consulta los horarios de salida por ruta
          </p>
        </motion.div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="body" style={{ color: '#a1a1a6' }}>Cargando horarios...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            {routes.map((route, index) => (
              <motion.div 
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: '#1d1d1f',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid #424245'
                }}
              >
                <h3 style={{ 
                  margin: '0 0 20px 0',
                  color: '#f5f5f7',
                  fontSize: '22px',
                  fontWeight: '700'
                }}>
                  {route.origin} - {route.destination}
                </h3>
                
                <div style={{
                  background: '#2c2c2e',
                  border: '1px solid #424245',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    background: '#ffa502',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    minWidth: '70px',
                    textAlign: 'center'
                  }}>
                    08:00
                  </div>
                  
                  <div>
                    <div style={{ color: '#f5f5f7', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                      BusReserva Pro
                    </div>
                    <div style={{ color: '#a1a1a6', fontSize: '12px' }}>
                      Duración: {route.duration || '8h'}
                    </div>
                  </div>
                  
                  <div style={{
                    color: '#ffa502',
                    fontSize: '16px',
                    fontWeight: '700'
                  }}>
                    S/ {route.price}
                  </div>
                  
                  <button 
                    onClick={() => handleReservar(route)}
                    className="btn"
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}
                  >
                    Reservar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Horarios;