import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="header">
      <div className="container" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
        <div className="nav-brand">
          <Link to="/">
            <img 
              src="/images/logo02.png" 
              alt="BusReserva" 
              style={{
                height: '38px',
                width: 'auto',
                cursor: 'pointer',
                marginLeft: '-80px'
              }}
            />
          </Link>
        </div>

        <nav className="nav-menu" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '25px',
          padding: '8px 16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>

          <Link 
            to="/reservas" 
            className={`nav-link ${isActive('/reservas') ? 'active' : ''}`}
            style={{ fontSize: '13px', fontWeight: '500' }}
          >
            Mis Reservas
          </Link>
          <Link 
            to="/horarios" 
            className={`nav-link ${isActive('/horarios') ? 'active' : ''}`}
            style={{ fontSize: '13px', fontWeight: '500' }}
          >
            Horarios
          </Link>
          <Link 
            to="/rutas" 
            className={`nav-link ${isActive('/rutas') ? 'active' : ''}`}
            style={{ fontSize: '13px', fontWeight: '500' }}
          >
            Rutas
          </Link>
          <Link 
            to="/soporte" 
            className={`nav-link ${isActive('/soporte') ? 'active' : ''}`}
            style={{ fontSize: '13px', fontWeight: '500' }}
          >
            Soporte
          </Link>
          <Link 
            to="/login" 
            className={`nav-link btn-style ${isActive('/login') ? 'active' : ''}`}
            style={{ fontSize: '13px', fontWeight: '600' }}
          >
            Mi Cuenta
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link btn-admin ${isActive('/admin') ? 'active' : ''}`}
            style={{ fontSize: '13px', fontWeight: '600' }}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;