import React, { useState, useEffect } from 'react';

const UnsplashImage = ({ query, width = 800, height = 400, className = '', style = {} }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usando imágenes locales
    const localImages = {
      'luxury bus interior travel': '/images/PAGINA PRINICPAL.795Z.png',
      'peru coast lima': '/images/Lima  Trujillo  Chiclayo  Piura.982Z.png',
      'peru andes mountains': '/images/Lima  Huancayo  Ayacucho  Cusco.811Z.png',
      'peru arequipa city': '/images/Ruta Sur Imperial.881Z.png',
      'peru amazon jungle': '/images/Ciudades principales.681Z.png',
      'customer support team office': '/images/SOPORTE.050Z.png',
      'modern office dashboard analytics': '/images/PAGINA PRINICPAL.795Z.png'
    };
    
    const localImage = localImages[query] || '/images/PAGINA PRINICPAL.795Z.png';
    setImageUrl(localImage);
    setLoading(false);
  }, [query, width, height]);

  if (loading) {
    return (
      <div 
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: '#1d1d1f',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        className={className}
      >
        <div className="caption" style={{ color: '#86868b' }}>
          Cargando imagen...
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={query}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'cover',
        borderRadius: '18px',
        ...style
      }}
      className={className}
      onError={(e) => {
        // Fallback simple
        e.target.style.background = '#1d1d1f';
        e.target.style.display = 'flex';
        e.target.style.alignItems = 'center';
        e.target.style.justifyContent = 'center';
        e.target.innerHTML = `<span style="color: #86868b; font-size: 14px;">${query}</span>`;
      }}
    />
  );
};

export default UnsplashImage;