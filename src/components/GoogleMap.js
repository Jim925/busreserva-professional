import React from 'react';

const MapComponent = ({ origin, destination, userLocation }) => {
  const mapStyles = {
    height: '400px',
    width: '100%',
    borderRadius: '15px',
    overflow: 'hidden'
  };

  // Create Google Maps search URL that works without API key
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(origin + ' to ' + destination + ', Peru')}&output=embed`;

  return (
    <div style={mapStyles}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: '15px' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Ruta de ${origin} a ${destination}`}
      ></iframe>
    </div>
  );
};

export default MapComponent;