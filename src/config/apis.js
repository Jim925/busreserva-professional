export const API_CONFIG = {
  GOOGLE_MAPS_API_KEY: 'AIzaSyBOti4mM-6x9WDnZIjIeyb7N2QjcM37K88',
  WEATHER_API_KEY: 'b6907d289e10d714a6e88b30761fae22',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51234567890abcdef',
  SOCKET_URL: 'http://localhost:3000',
  QR_API_URL: 'https://api.qrserver.com/v1/create-qr-code',
  UNSPLASH_ACCESS_KEY: 'YOUR_UNSPLASH_ACCESS_KEY',
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  },
  NOTIFICATION_OPTIONS: {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    requireInteraction: false
  }
};

export default API_CONFIG;