import React, { useState, useEffect } from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiSnow } from 'react-icons/wi';
import { API_CONFIG } from '../config/apis';
import LoadingSpinner from './LoadingSpinner';

const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  const fetchWeather = async (cityName) => {
    try {
      // Usando API gratuita de OpenWeather
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=b6907d289e10d714a6e88b30761fae22&units=metric&lang=es`
      );
      
      if (!response.ok) {
        throw new Error('Weather API error');
      }
      
      const data = await response.json();
      setWeather(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback con datos simulados
      const mockWeatherData = {
        name: cityName,
        main: { temp: Math.floor(Math.random() * 25) + 10 },
        weather: [{
          main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
          description: 'Soleado'
        }]
      };
      setWeather(mockWeatherData);
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain?.toLowerCase()) {
      case 'clear': return <WiDaySunny size={40} color="#FFD700" />;
      case 'clouds': return <WiCloudy size={40} color="#87CEEB" />;
      case 'rain': return <WiRain size={40} color="#4682B4" />;
      case 'snow': return <WiSnow size={40} color="#B0C4DE" />;
      default: return <WiDaySunny size={40} color="#FFD700" />;
    }
  };

  if (loading) return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      minWidth: '140px',
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ fontSize: '12px', color: '#6b7280' }}>Cargando...</div>
    </div>
  );
  if (!weather || !weather.weather || !weather.weather[0] || !weather.main) return null;

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      padding: '16px',
      borderRadius: '8px',
      textAlign: 'center',
      minWidth: '140px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        {getWeatherIcon(weather.weather[0]?.main)}
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
          {Math.round(weather.main?.temp || 0)}°C
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
        {weather.weather[0]?.description || 'Soleado'}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
        {weather.name || city}
      </div>
    </div>
  );
};

export default WeatherWidget;