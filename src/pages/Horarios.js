import React from 'react';
import { motion } from 'framer-motion';

const Horarios = () => {
  const horarios = [
    { 
      ruta: 'Lima - Arequipa', 
      horarios: [
        { hora: '06:30', empresa: 'Cruz del Sur', precio: 'S/ 95', duracion: '15h 20m' },
        { hora: '20:00', empresa: 'Oltursa', precio: 'S/ 85', duracion: '16h 30m' },
        { hora: '21:30', empresa: 'Tepsa', precio: 'S/ 75', duracion: '17h 00m' },
        { hora: '22:00', empresa: 'Civa', precio: 'S/ 90', duracion: '15h 45m' }
      ]
    },
    { 
      ruta: 'Lima - Cusco', 
      horarios: [
        { hora: '07:00', empresa: 'Cruz del Sur', precio: 'S/ 120', duracion: '18h 45m' },
        { hora: '19:00', empresa: 'Oltursa', precio: 'S/ 110', duracion: '20h 15m' },
        { hora: '20:30', empresa: 'Tepsa', precio: 'S/ 95', duracion: '21h 30m' }
      ]
    },
    { 
      ruta: 'Lima - Trujillo', 
      horarios: [
        { hora: '08:00', empresa: 'Cruz del Sur', precio: 'S/ 85', duracion: '12h 30m' },
        { hora: '21:00', empresa: 'Linea', precio: 'S/ 65', duracion: '13h 45m' },
        { hora: '22:00', empresa: 'Oltursa', precio: 'S/ 75', duracion: '12h 15m' },
        { hora: '23:30', empresa: 'Movil Tours', precio: 'S/ 70', duracion: '13h 00m' }
      ]
    },
    { 
      ruta: 'Arequipa - Puno', 
      horarios: [
        { hora: '06:00', empresa: 'Cruz del Sur', precio: 'S/ 45', duracion: '5h 30m' },
        { hora: '14:00', empresa: 'Tepsa', precio: 'S/ 35', duracion: '6h 15m' },
        { hora: '20:00', empresa: 'Civa', precio: 'S/ 40', duracion: '5h 45m' }
      ]
    }
  ];

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
        
        <div style={{ display: 'grid', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
          {horarios.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 style={{ 
                margin: '0 0 20px 0',
                color: '#1a1a1a',
                fontSize: '22px',
                fontWeight: '700'
              }}>
                {item.ruta}
              </h3>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {item.horarios.map((horario, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto',
                      gap: '16px',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
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
                      {horario.hora}
                    </div>
                    
                    <div>
                      <div style={{ color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                        {horario.empresa}
                      </div>
                      <div style={{ color: '#666666', fontSize: '12px' }}>
                        Duración: {horario.duracion}
                      </div>
                    </div>
                    
                    <div style={{
                      color: '#cc7a00',
                      fontSize: '16px',
                      fontWeight: '700'
                    }}>
                      {horario.precio}
                    </div>
                    
                    <button style={{
                      background: '#ffa502',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}>
                      Reservar
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Horarios;