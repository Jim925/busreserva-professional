import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import BusList from '../components/BusList';
import GoogleMap from '../components/GoogleMap';
import UnsplashImage from '../components/UnsplashImage';
import { useGeolocation } from '../hooks/useGeolocation';
import { busService } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const { location, error, loading } = useGeolocation();
  
  const phrases = [
    'Listo para explorar el Perú.',
    'Descubre la magia de los Andes.',
    'Conectamos todo el territorio peruano.',
    'Tu aventura comienza aquí.',
    'Viaja cómodo y seguro.'
  ];
  
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100;
    const fullPhrase = phrases[phraseIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting && currentPhrase === fullPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentPhrase === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setCurrentPhrase(prev => 
          isDeleting 
            ? prev.slice(0, -1)
            : fullPhrase.slice(0, prev.length + 1)
        );
      }
    }, typeSpeed);
    
    return () => clearTimeout(timer);
  }, [currentPhrase, isDeleting, phraseIndex, phrases]);

  const handleSearch = async (searchData) => {
    toast.loading('Buscando viajes...', { id: 'search' });
    
    try {
      const routes = await busService.getRoutes();
      const filteredRoutes = routes.filter(route => 
        route.origin.toLowerCase().includes(searchData.origen.toLowerCase()) &&
        route.destination.toLowerCase().includes(searchData.destino.toLowerCase())
      );
      
      const realResults = filteredRoutes.map(route => ({
        id: route.id,
        origen: route.origin,
        destino: route.destination,
        fecha: searchData.fecha,
        hora: '08:00',
        precio: route.price,
        asientosDisponibles: Math.floor(Math.random() * 20) + 5,
        empresa: 'BusReserva Pro',
        duracion: route.duration || '8h'
      }));
      
      setSearchResults(realResults);
      setSelectedRoute({ origen: searchData.origen, destino: searchData.destino });
      toast.success(`${realResults.length} viajes encontrados!`, { id: 'search' });
    } catch (error) {
      toast.error('Error al buscar viajes', { id: 'search' });
      console.error('Error:', error);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh'
      }}>
        <img 
          src="/images/hero-bg.png" 
          alt="" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }} />

        
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <h1 className="large-title" style={{ 
              marginBottom: '24px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              fontSize: '72px'
            }}>
              Viaja mejor.
              <br />
              <span style={{ color: '#ffa502' }}>Viaja simple.</span>
            </h1>
            <p className="title-3" style={{ 
              color: '#f5f5f7',
              marginBottom: '40px',
              fontWeight: '400',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
              minHeight: '50px',
              fontSize: '36px'
            }}>
              {loading ? 'Detectando ubicación...' : 
               error ? 'Conectamos todo el Perú con comodidad y seguridad.' : 
               currentPhrase}<span style={{ opacity: Math.sin(Date.now() / 500) > 0 ? 1 : 0 }}>|</span>
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '220px' }}>
              <Link to="/reservas" className="btn" style={{ fontSize: '20px', padding: '16px 32px', textDecoration: 'none' }}>Reservar ahora</Link>
              <Link to="/horarios" className="btn btn-secondary" style={{ fontSize: '20px', padding: '16px 32px', textDecoration: 'none' }}>Ver horarios</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="section section-light">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 className="title-1" style={{ marginBottom: '16px' }}>
              Planifica tu viaje
            </h2>
            <p className="body">
              Encuentra la opción perfecta para tu destino
            </p>
          </motion.div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {selectedRoute && (
        <section className="section">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '60px' }}
            >
              <h2 className="title-2" style={{ marginBottom: '16px' }}>
                Tu ruta
              </h2>
              <GoogleMap 
                origin={selectedRoute.origen}
                destination={selectedRoute.destino}
                userLocation={location}
              />
            </motion.div>
          </div>
        </section>
      )}

      {searchResults.length > 0 && (
        <section className="section section-light">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '60px' }}
            >
              <h2 className="title-1" style={{ marginBottom: '16px' }}>
                Viajes disponibles
              </h2>
              <BusList buses={searchResults} />
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;