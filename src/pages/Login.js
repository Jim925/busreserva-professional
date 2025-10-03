import React, { useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Funcionalidad de login');
  };

  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="title-1" style={{ marginBottom: '48px' }}>
            Iniciar sesión
          </h1>
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '24px' }}>
              Continuar
            </button>
          </form>
          <div style={{ marginTop: '32px' }}>
            <p className="body">
              ¿No tienes cuenta? <a href="#" style={{ color: '#0071e3', textDecoration: 'none' }}>Crear cuenta</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;