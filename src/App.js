import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Reservas from './pages/Reservas';
import Horarios from './pages/Horarios';
import Rutas from './pages/Rutas';
import Soporte from './pages/Soporte';
import RealTimeUpdates from './components/RealTimeUpdates';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Header />
        <RealTimeUpdates />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/horarios" element={<Horarios />} />
          <Route path="/rutas" element={<Rutas />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;