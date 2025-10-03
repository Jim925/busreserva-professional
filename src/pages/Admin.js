import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UnsplashImage from '../components/UnsplashImage';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('buses');

  const mockBuses = [
    { id: 1, placa: 'AQP-123', capacidad: 40, estado: 'Activo', ubicacion: 'Lima', pasajeros: 32 },
    { id: 2, placa: 'LIM-456', capacidad: 35, estado: 'En Ruta', ubicacion: 'Arequipa', pasajeros: 28 },
    { id: 3, placa: 'CUS-789', capacidad: 45, estado: 'Mantenimiento', ubicacion: 'Taller', pasajeros: 0 }
  ];

  const mockRutas = [
    { id: 1, origen: 'Lima', destino: 'Arequipa', duracion: '15h 30m', precio: 95 },
    { id: 2, origen: 'Lima', destino: 'Cusco', duracion: '18h 45m', precio: 120 },
    { id: 3, origen: 'Lima', destino: 'Trujillo', duracion: '8h 15m', precio: 65 }
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
              onClick={() => setActiveTab('buses')}
              style={{
                background: activeTab === 'buses' ? '#0071e3' : 'transparent',
                color: activeTab === 'buses' ? 'white' : '#f5f5f7',
                border: activeTab === 'buses' ? 'none' : '1px solid #424245',
                padding: '12px 24px',
                borderRadius: '980px',
                cursor: 'pointer',
                fontSize: '17px',
                fontFamily: '"SF Pro Display", sans-serif'
              }}
            >
              Autobuses
            </button>
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
          </div>
        </motion.div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {activeTab === 'buses' && (
            <div>
              <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Flota de autobuses</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                {mockBuses.map(bus => (
                  <div
                    key={bus.id}
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
                        {bus.placa}
                      </h3>
                      <div className="body" style={{ color: '#a1a1a6', marginBottom: '4px' }}>
                        Capacidad: {bus.capacidad} • Ubicación: {bus.ubicacion}
                      </div>
                      <div className="caption" style={{
                        color: bus.estado === 'Activo' ? '#30d158' : 
                               bus.estado === 'En Ruta' ? '#0071e3' : '#ff9f0a'
                      }}>
                        {bus.estado} • {bus.pasajeros}/{bus.capacidad} pasajeros
                      </div>
                    </div>
                    <button className="btn btn-secondary">
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rutas' && (
            <div>
              <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Gestión de rutas</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                {mockRutas.map(ruta => (
                  <div
                    key={ruta.id}
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
                        {ruta.origen} → {ruta.destino}
                      </h3>
                      <div className="body" style={{ color: '#a1a1a6' }}>
                        {ruta.duracion} • €{ruta.precio}
                      </div>
                    </div>
                    <button className="btn btn-secondary">
                      Editar
                    </button>
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