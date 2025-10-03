import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha: '',
    pasajeros: 1
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <div style={{
      background: 'rgba(128, 128, 128, 0.2)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: '18px',
      padding: '40px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="form-group">
            <label style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '700' }}>Origen</label>
            <select name="origen" value={formData.origen} onChange={handleChange} required style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              color: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              width: '100%',
              fontWeight: '600'
            }}>
              <option value="">Seleccionar ciudad de origen</option>
              <option value="Lima">Lima</option>
              <option value="Arequipa">Arequipa</option>
              <option value="Cusco">Cusco</option>
              <option value="Trujillo">Trujillo</option>
              <option value="Chiclayo">Chiclayo</option>
              <option value="Piura">Piura</option>
              <option value="Huancayo">Huancayo</option>
              <option value="Ayacucho">Ayacucho</option>
              <option value="Ica">Ica</option>
              <option value="Puno">Puno</option>
            </select>
          </div>
          
          <div className="form-group">
            <label style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '700' }}>Destino</label>
            <select name="destino" value={formData.destino} onChange={handleChange} required style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              color: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              width: '100%',
              fontWeight: '600'
            }}>
              <option value="">Seleccionar ciudad de destino</option>
              <option value="Lima">Lima</option>
              <option value="Arequipa">Arequipa</option>
              <option value="Cusco">Cusco</option>
              <option value="Trujillo">Trujillo</option>
              <option value="Chiclayo">Chiclayo</option>
              <option value="Piura">Piura</option>
              <option value="Huancayo">Huancayo</option>
              <option value="Ayacucho">Ayacucho</option>
              <option value="Ica">Ica</option>
              <option value="Puno">Puno</option>
            </select>
          </div>
          
          <div className="form-group">
            <label style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '700' }}>Fecha de viaje</label>
            <input 
              type="date" 
              name="fecha" 
              value={formData.fecha} 
              onChange={handleChange} 
              required 
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                color: '#1a1a1a',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '16px',
                width: '100%',
                fontWeight: '600'
              }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '700' }}>Pasajeros</label>
            <select name="pasajeros" value={formData.pasajeros} onChange={handleChange} style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              color: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              width: '100%',
              fontWeight: '600'
            }}>
              <option value="1">1 pasajero</option>
              <option value="2">2 pasajeros</option>
              <option value="3">3 pasajeros</option>
              <option value="4">4 pasajeros</option>
              <option value="5">5 pasajeros</option>
              <option value="6">6+ pasajeros</option>
            </select>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button type="submit" className="btn" style={{ 
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: '600',
            minWidth: '200px'
          }}>
            Buscar Viajes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;