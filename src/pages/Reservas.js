import React from 'react';
import { motion } from 'framer-motion';

const Reservas = () => {
  const mockReservas = [
    {
      id: 'TKT-2024-001',
      origen: 'Lima',
      destino: 'Arequipa',
      fecha: '2024-01-15',
      hora: '21:30',
      asiento: '12A',
      estado: 'Confirmada',
      precio: 95.00
    },
    {
      id: 'TKT-2024-002',
      origen: 'Lima',
      destino: 'Cusco',
      fecha: '2024-01-20',
      hora: '20:00',
      asiento: '8B',
      estado: 'Pendiente',
      precio: 120.00
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
            Mis reservas
          </h1>
          <p className="body">
            Gestiona tus viajes programados
          </p>
        </motion.div>
        
        <div style={{ display: 'grid', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {mockReservas.map((reserva, index) => (
            <div
              key={reserva.id}
              style={{
                background: '#1d1d1f',
                borderRadius: '18px',
                padding: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 className="headline" style={{ margin: '0 0 8px 0', color: '#f5f5f7' }}>
                  {reserva.origen} → {reserva.destino}
                </h3>
                <div className="body" style={{ color: '#a1a1a6', marginBottom: '4px' }}>
                  {reserva.fecha} • {reserva.hora} • Asiento {reserva.asiento}
                </div>
                <div className="caption" style={{ color: '#86868b' }}>
                  {reserva.id}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="title-2" style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                  S/{reserva.precio}
                </div>
                <div className="caption" style={{
                  color: reserva.estado === 'Confirmada' ? '#30d158' : '#ff9f0a'
                }}>
                  {reserva.estado}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reservas;