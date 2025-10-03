import React from 'react';
import { motion } from 'framer-motion';

const StatsBar = () => {
  const stats = [
    { value: '2.5M+', label: 'Pasajeros Anuales', icon: '👥' },
    { value: '500+', label: 'Destinos', icon: '🌍' },
    { value: '99.8%', label: 'Puntualidad', icon: '⏱️' },
    { value: '24/7', label: 'Soporte', icon: '🛟' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="apple-shadow"
      style={{
        background: '#f5f5f7',
        borderRadius: '18px',
        padding: '48px 32px',
        margin: '60px 0',
        border: '1px solid rgba(0, 0, 0, 0.04)'
      }}
    >
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '32px',
        textAlign: 'center'
      }}>
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
              {stat.icon}
            </div>
            <div className="large-title sf-pro" style={{
              color: '#1d1d1f',
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>
            <div className="caption sf-pro" style={{
              color: '#86868b',
              fontWeight: '400',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StatsBar;