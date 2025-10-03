import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { busService } from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('rutas');
  const [routes, setRoutes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoute, setNewRoute] = useState({
    origin: '',
    destination: '',
    price: '',
    duration: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routesData, reservationsData] = await Promise.all([
        busService.getRoutes(),
        busService.getReservations()
      ]);
      setRoutes(routesData);
      setReservations(reservationsData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3005/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: newRoute.origin,
          destination: newRoute.destination,
          price: parseFloat(newRoute.price),
          duration: newRoute.duration
        })
      });
      toast.success('Ruta agregada exitosamente');
      setNewRoute({ origin: '', destination: '', price: '', duration: '' });
      loadData();
    } catch (error) {
      toast.error('Error al agregar ruta');
    }
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
            Administración
          </h1>
          
          <img 
            src="/images/analiticas.png"
            alt="Analytics Dashboard"
            style={{ 
              width: '700px',
              height: '250px',
              objectFit: 'cover',
              borderRadius: '18px',
              margin: '0 auto 40px auto',
              display: 'block'
            }}
          />
          
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '48px' }}>
            <button 
              onClick={() => setActiveTab('rutas')}
              style={{
                background: activeTab === 'rutas' ? '#0071e3' : 'transparent',
                color: activeTab === 'rutas' ? 'white' : '#f5f5f7',
                border: activeTab === 'rutas' ? 'none' : '1px solid #424245',
                padding: '12px 24px',
                borderRadius: '980px',
                cursor: 'pointer',
                fontSize: '17px',
                fontFamily: '"SF Pro Display", sans-serif'
              }}
            >
              Rutas
            </button>
            <button 
              onClick={() => setActiveTab('reservas')}
              style={{
                background: activeTab === 'reservas' ? '#0071e3' : 'transparent',
                color: activeTab === 'reservas' ? 'white' : '#f5f5f7',
                border: activeTab === 'reservas' ? 'none' : '1px solid #424245',
                padding: '12px 24px',
                borderRadius: '980px',
                cursor: 'pointer',
                fontSize: '17px',
                fontFamily: '"SF Pro Display", sans-serif'
              }}
            >
              Reservas
            </button>
          </div>
        </motion.div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {activeTab === 'rutas' && (
            <div>
              <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Gestión de Rutas</h2>
              
              <form onSubmit={handleAddRoute} style={{
                background: '#1d1d1f',
                borderRadius: '18px',
                padding: '32px',
                marginBottom: '32px',
                display: 'grid',
                gap: '16px'
              }}>
                <h3 className="headline" style={{ color: '#f5f5f7', marginBottom: '16px' }}>Agregar Nueva Ruta</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder="Origen"
                    value={newRoute.origin}
                    onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})}
                    required
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Destino"
                    value={newRoute.destination}
                    onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
                    required
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newRoute.price}
                    onChange={(e) => setNewRoute({...newRoute, price: e.target.value})}
                    required
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Duración (ej: 8h)"
                    value={newRoute.duration}
                    onChange={(e) => setNewRoute({...newRoute, duration: e.target.value})}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <button type="submit" className="btn" style={{ justifySelf: 'start' }}>
                  Agregar Ruta
                </button>
              </form>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                {routes.map(route => (
                  <div
                    key={route.id}
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
                        {route.origin} → {route.destination}
                      </h3>
                      <div className="body" style={{ color: '#a1a1a6' }}>
                        {route.duration || '8h'} • S/{route.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reservas' && (
            <div>
              <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Reservas Activas</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                {reservations.map(reservation => (
                  <div
                    key={reservation.id}
                    style={{
                      background: '#1d1d1f',
                      borderRadius: '18px',
                      padding: '32px'
                    }}
                  >
                    <h3 className="headline" style={{ margin: '0 0 8px 0', color: '#f5f5f7' }}>
                      {reservation.origin} → {reservation.destination}
                    </h3>
                    <div className="body" style={{ color: '#a1a1a6', marginBottom: '4px' }}>
                      Cliente: {reservation.user_name} • {reservation.user_email}
                    </div>
                    <div className="caption" style={{ color: '#30d158' }}>
                      Asiento {reservation.seat_number} • S/{reservation.total_price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Admin;