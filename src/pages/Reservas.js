import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { busService } from '../services/api';
import ReservationForm from '../components/ReservationForm';
import toast from 'react-hot-toast';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await busService.getReservations();
      setReservas(data);
    } catch (error) {
      toast.error('Error al cargar reservas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ background: '#000', minHeight: '100vh' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '60px', paddingTop: '40px' }}
        >
          <h1 className="title-1" style={{ marginBottom: '16px', color: '#f5f5f7', fontSize: '48px', fontWeight: '700' }}>
            Mis Reservas
          </h1>
          <p className="body" style={{ color: '#a1a1a6', fontSize: '20px' }}>
            Gestiona tus viajes programados
          </p>
        </motion.div>
        
        <div style={{ marginBottom: '60px' }}>
          <ReservationForm onReservationCreated={loadReservations} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 className="title-2" style={{ color: '#f5f5f7' }}>
            Reservas Existentes
          </h2>
        </motion.div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#1d1d1f', borderRadius: '18px' }}>
            <div className="body" style={{ color: '#a1a1a6', fontSize: '18px' }}>Cargando reservas...</div>
          </div>
        ) : reservas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: '#1d1d1f', borderRadius: '18px' }}>
            <div className="title-2" style={{ color: '#f5f5f7', marginBottom: '12px' }}>No tienes reservas aún</div>
            <div className="body" style={{ color: '#a1a1a6' }}>Crea tu primera reserva usando el formulario de arriba</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {reservas.map((reserva) => (
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
                    {reserva.origin} → {reserva.destination}
                  </h3>
                  <div className="body" style={{ color: '#a1a1a6', marginBottom: '4px' }}>
                    {new Date(reserva.created_at).toLocaleDateString('es-PE')} • Asiento {reserva.seat_number}
                  </div>
                  <div className="caption" style={{ color: '#86868b' }}>
                    {reserva.user_name} • {reserva.user_email}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="title-2" style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                    S/{reserva.total_price}
                  </div>
                  <div className="caption" style={{ color: '#30d158' }}>
                    Confirmada
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Reservas;