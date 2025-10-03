import React from 'react';
import { motion } from 'framer-motion';
import UnsplashImage from '../components/UnsplashImage';

const Rutas = () => {
  const rutas = [
    { 
      nombre: 'Ruta Costa Norte',
      ciudades: ['Lima', 'Trujillo', 'Chiclayo', 'Piura'],
      duracion: '12h 30m',
      precio: 'desde S/85',
      imagePath: '/images/costa.png'
    },
    {
      nombre: 'Corredor Andino', 
      ciudades: ['Lima', 'Huancayo', 'Ayacucho', 'Cusco'],
      duracion: '18h 45m',
      precio: 'desde S/120',
      imagePath: '/images/andino.png'
    },
    {
      nombre: 'Ruta Sur Imperial',
      ciudades: ['Lima', 'Ica', 'Arequipa', 'Puno'],
      duracion: '15h 20m', 
      precio: 'desde S/95',
      imagePath: '/images/sur.png'
    },
    {
      nombre: 'Conexión Selva',
      ciudades: ['Lima', 'Tingo María', 'Pucallpa', 'Iquitos'],
      duracion: '20h 15m',
      precio: 'desde S/140',
      imagePath: '/images/selva.png'
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
            Rutas disponibles
          </h1>
          <p className="body">
            Explora nuestra red de destinos
          </p>
        </motion.div>
        
        <div style={{ display: 'grid', gap: '40px', maxWidth: '900px', margin: '0 auto' }}>
          {rutas.map((ruta, index) => (
            <div
              key={index}
              style={{
                background: '#1d1d1f',
                borderRadius: '18px',
                padding: '0',
                overflow: 'hidden'
              }}
            >
              <img 
                src={ruta.imagePath}
                alt={ruta.nombre}
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover',
                  borderRadius: '18px 18px 0 0' 
                }}
              />
              
              <div style={{ padding: '32px' }}>
                <h3 className="headline" style={{ margin: '0 0 16px 0', color: '#f5f5f7' }}>
                  {ruta.nombre}
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <div className="caption" style={{ marginBottom: '8px', color: '#86868b' }}>
                    Ciudades principales
                  </div>
                  <div className="body" style={{ color: '#a1a1a6' }}>
                    {ruta.ciudades.join(' • ')}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div className="caption" style={{ color: '#86868b' }}>Duración</div>
                    <div className="body" style={{ color: '#f5f5f7' }}>{ruta.duracion}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="caption" style={{ color: '#86868b' }}>Precio</div>
                    <div className="body" style={{ color: '#ffa502' }}>{ruta.precio}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rutas;