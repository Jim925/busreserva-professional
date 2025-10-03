import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isRegister, setIsRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3005/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Bienvenido ${data.name}!`);
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '/';
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3005/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Cuenta creada exitosamente!');
        setIsRegister(false);
        setRegisterData({ name: '', email: '', password: '' });
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '450px', margin: '0 auto' }}
        >
          <div style={{
            background: '#1d1d1f',
            borderRadius: '18px',
            padding: '48px',
            border: '1px solid #424245'
          }}>
            <h1 className="title-1" style={{ marginBottom: '32px', textAlign: 'center', color: '#f5f5f7' }}>
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </h1>
            
            {!isRegister ? (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn" 
                  style={{ 
                    width: '100%', 
                    padding: '16px',
                    fontSize: '18px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Iniciando...' : 'Continuar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>Nombre completo</label>
                  <input
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label className="body" style={{ color: '#a1a1a6', marginBottom: '8px', display: 'block' }}>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn" 
                  style={{ 
                    width: '100%', 
                    padding: '16px',
                    fontSize: '18px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Creando...' : 'Crear cuenta'}
                </button>
              </form>
            )}
            
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <p className="body" style={{ color: '#a1a1a6' }}>
                {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0071e3',
                    cursor: 'pointer',
                    fontSize: '16px',
                    textDecoration: 'underline'
                  }}
                >
                  {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Login;