import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRTicket from './QRTicket';
import toast from 'react-hot-toast';

const BusCard = ({ bus }) => {
  const [showTicket, setShowTicket] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const handleReserve = async () => {
    setIsReserving(true);
    toast.loading('Procesando reserva...', { id: 'reserve' });
    
    // Simular proceso de reserva
    setTimeout(() => {
      const ticketData = {
        id: `BRP-${Date.now()}`,
        passenger: 'Usuario Demo',
        origen: bus.origen,
        destino: bus.destino,
        fecha: bus.fecha,
        hora: bus.hora,
        asiento: `${Math.floor(Math.random() * 40) + 1}A`,
        precio: bus.precio,
        empresa: bus.empresa,
        duracion: bus.duracion
      };
      
      setShowTicket(true);
      setIsReserving(false);
      toast.success('Reserva confirmada exitosamente', { id: 'reserve' });
      
      // Enviar notificación
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Reserva Confirmada - BusReserva', {
          body: `Tu viaje ${bus.origen} - ${bus.destino} está confirmado`,
          icon: '/favicon.ico'
        });
      }
    }, 1500);
  };

  if (showTicket) {
    const ticketData = {
      id: `TKT-${Date.now()}`,
      passenger: 'Usuario Demo',
      origen: bus.origen,
      destino: bus.destino,
      fecha: bus.fecha,
      hora: bus.hora,
      asiento: `${Math.floor(Math.random() * 40) + 1}A`
    };
    
    return (
      <div>
        <QRTicket ticketData={ticketData} />
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button 
            onClick={() => setShowTicket(false)}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Volver a la búsqueda
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        margin: '16px 0',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h3 style={{ 
              margin: 0, 
              color: '#1a1a1a',
              fontSize: '20px',
              fontWeight: '700',
              textShadow: 'none'
            }}>
              {bus.origen} → {bus.destino}
            </h3>
            <span style={{
              background: bus.empresa === 'Cruz del Sur' ? '#ffa502' : bus.empresa === 'Oltursa' ? '#0071e3' : '#30d158',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {bus.empresa || 'BusReserva'}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '12px' }}>
            <div>
              <div style={{ color: '#666666', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Fecha y Hora</div>
              <div style={{ color: '#1a1a1a', fontSize: '14px', fontWeight: '600' }}>
                {new Date(bus.fecha).toLocaleDateString('es-PE')} • {bus.hora}
              </div>
            </div>
            
            <div>
              <div style={{ color: '#666666', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Duración</div>
              <div style={{ color: '#1a1a1a', fontSize: '14px', fontWeight: '600' }}>
                {bus.duracion || '8h 30m'}
              </div>
            </div>
            
            <div>
              <div style={{ color: '#666666', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>Asientos</div>
              <div style={{
                color: bus.asientosDisponibles > 10 ? '#0d7a2d' : bus.asientosDisponibles > 5 ? '#cc7a00' : '#cc0000',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {bus.asientosDisponibles} disponibles
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            color: '#cc7a00',
            fontSize: '24px',
            fontWeight: '800',
            marginBottom: '12px',
            textShadow: 'none'
          }}>
            S/ {bus.precio}
          </div>
          <button 
            onClick={handleReserve}
            disabled={isReserving || bus.asientosDisponibles === 0}
            style={{
              background: isReserving ? '#424245' : bus.asientosDisponibles === 0 ? '#6c757d' : '#ffa502',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isReserving || bus.asientosDisponibles === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px'
            }}
          >
            {isReserving ? 'Reservando...' : bus.asientosDisponibles === 0 ? 'Agotado' : 'Reservar'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BusCard;