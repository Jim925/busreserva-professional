import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { busService } from '../services/api';
import toast from 'react-hot-toast';

const ReservationForm = ({ onReservationCreated }) => {
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    route_id: '',
    seat_number: Math.floor(Math.random() * 40) + 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await busService.getRoutes();
      setRoutes(data);
    } catch (error) {
      toast.error('Error al cargar rutas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedRoute = routes.find(r => r.id === parseInt(formData.route_id));
      const reservationData = {
        ...formData,
        route_id: parseInt(formData.route_id),
        total_price: selectedRoute?.price || 0
      };

      await busService.createReservation(reservationData);
      toast.success('¡Reserva creada exitosamente!');
      
      // Reset form
      setFormData({
        user_name: '',
        user_email: '',
        route_id: '',
        seat_number: Math.floor(Math.random() * 40) + 1
      });
      
      // Notify parent to reload reservations
      if (onReservationCreated) {
        onReservationCreated();
      }
    } catch (error) {
      toast.error('Error al crear la reserva');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#1d1d1f',
        borderRadius: '18px',
        padding: '32px',
        maxWidth: '500px',
        margin: '0 auto'
      }}
    >
      <h2 className="title-2" style={{ color: '#f5f5f7', marginBottom: '24px', textAlign: 'center' }}>
        Nueva Reserva
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>
            Nombre completo
          </label>
          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            required
            placeholder="Ej: Juan Pérez"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #424245',
              background: '#2c2c2e',
              color: '#f5f5f7',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>
            Email
          </label>
          <input
            type="email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            required
            placeholder="ejemplo@email.com"
            style={{
              width: '100%',
              padding: '18px 20px',
              borderRadius: '8px',
              border: '1px solid #424245',
              background: '#2c2c2e',
              color: '#f5f5f7',
              fontSize: '18px',
              minHeight: '60px'
            }}
          />
        </div>

        <div>
          <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>
            Ruta
          </label>
          <select
            name="route_id"
            value={formData.route_id}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #424245',
              background: '#2c2c2e',
              color: '#f5f5f7',
              fontSize: '16px'
            }}
          >
            <option value="">Selecciona una ruta</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.origin} → {route.destination} - S/{route.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>
            Asiento (1-40)
          </label>
          <input
            type="number"
            name="seat_number"
            value={formData.seat_number}
            onChange={handleChange}
            min="1"
            max="40"
            required
            placeholder="Ej: 15"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #424245',
              background: '#2c2c2e',
              color: '#f5f5f7',
              fontSize: '16px'
            }}
          />
        </div>
        
        {formData.route_id && (
          <div style={{
            background: '#2c2c2e',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #424245'
          }}>
            <div className="caption" style={{ color: '#a1a1a6', marginBottom: '8px' }}>
              Resumen de la reserva:
            </div>
            <div className="body" style={{ color: '#f5f5f7' }}>
              Precio: S/{routes.find(r => r.id === parseInt(formData.route_id))?.price || 0}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn"
          style={{
            marginTop: '20px',
            padding: '16px',
            fontSize: '18px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Creando reserva...' : 'Crear Reserva'}
        </button>
      </form>
    </motion.div>
  );
};

export default ReservationForm;