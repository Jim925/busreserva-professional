import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#667eea'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          marginBottom: '15px'
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ margin: 0, fontSize: '16px' }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;