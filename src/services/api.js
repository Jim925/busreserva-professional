import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const busService = {
  // Obtener todas las rutas
  getRoutes: async () => {
    try {
      const response = await api.get('/routes');
      return response.data;
    } catch (error) {
      console.error('Error getting routes:', error);
      throw error;
    }
  },

  // Crear reserva
  createReservation: async (reservationData) => {
    try {
      const response = await api.post('/reservations', reservationData);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Admin - obtener autobuses
  getBuses: async () => {
    try {
      const response = await api.get('/admin/buses');
      return response.data;
    } catch (error) {
      console.error('Error getting buses:', error);
      throw error;
    }
  },

  // Obtener reservas
  getReservations: async () => {
    try {
      const response = await api.get('/reservations');
      return response.data;
    } catch (error) {
      console.error('Error getting reservations:', error);
      throw error;
    }
  }
};

export default api;