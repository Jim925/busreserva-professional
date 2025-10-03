import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    reservations: [],
    revenue: [],
    routes: [],
    realTimeStats: {}
  });

  useEffect(() => {
    // Simular datos de analytics
    const mockData = {
      reservations: [
        { name: 'Lun', reservas: 24, ingresos: 1200 },
        { name: 'Mar', reservas: 35, ingresos: 1750 },
        { name: 'Mié', reservas: 28, ingresos: 1400 },
        { name: 'Jue', reservas: 42, ingresos: 2100 },
        { name: 'Vie', reservas: 55, ingresos: 2750 },
        { name: 'Sáb', reservas: 38, ingresos: 1900 },
        { name: 'Dom', reservas: 31, ingresos: 1550 }
      ],
      revenue: [
        { mes: 'Ene', ingresos: 15420 },
        { mes: 'Feb', ingresos: 18230 },
        { mes: 'Mar', ingresos: 22100 },
        { mes: 'Abr', ingresos: 19800 },
        { mes: 'May', ingresos: 25600 }
      ],
      routes: [
        { name: 'Madrid-Barcelona', value: 35, color: '#667eea' },
        { name: 'Valencia-Sevilla', value: 25, color: '#764ba2' },
        { name: 'Bilbao-Madrid', value: 20, color: '#f093fb' },
        { name: 'Otros', value: 20, color: '#4facfe' }
      ],
      realTimeStats: {
        activeUsers: 127,
        onlineBookings: 8,
        activeBuses: 15,
        totalRevenue: 25420
      }
    };

    setAnalyticsData(mockData);

    // Actualizar estadísticas en tiempo real cada 5 segundos
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        realTimeStats: {
          ...prev.realTimeStats,
          activeUsers: Math.floor(Math.random() * 200) + 50,
          onlineBookings: Math.floor(Math.random() * 15) + 1,
          activeBuses: Math.floor(Math.random() * 20) + 10
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        color: 'white',
        padding: '20px',
        borderRadius: '15px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>{value}</div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>{title}</div>
    </motion.div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '30px' }}>📊 Analytics Dashboard</h2>
      
      {/* Estadísticas en tiempo real */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard 
          title="Usuarios Activos" 
          value={analyticsData.realTimeStats.activeUsers} 
          icon="👥" 
          color="#667eea" 
        />
        <StatCard 
          title="Reservas Online" 
          value={analyticsData.realTimeStats.onlineBookings} 
          icon="🎫" 
          color="#764ba2" 
        />
        <StatCard 
          title="Autobuses Activos" 
          value={analyticsData.realTimeStats.activeBuses} 
          icon="🚌" 
          color="#f093fb" 
        />
        <StatCard 
          title="Ingresos Total" 
          value={`€${analyticsData.realTimeStats.totalRevenue?.toLocaleString()}`} 
          icon="💰" 
          color="#4facfe" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Gráfico de reservas semanales */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          <h3>Reservas Semanales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.reservations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="reservas" stroke="#667eea" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de ingresos mensuales */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          <h3>Ingresos Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#764ba2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de rutas populares */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
        <h3>Rutas Más Populares</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData.routes}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {analyticsData.routes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;