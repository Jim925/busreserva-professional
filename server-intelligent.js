const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'busreserva_secret_key_2024';
const cache = new NodeCache({ stdTTL: 300 });

// Middleware de seguridad
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Pool de conexiones MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bus_reservation',
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Validadores inteligentes
const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone) => /^[\+]?[0-9\s\-\(\)]{9,}$/.test(phone),
  busNumber: (number) => /^BUS\d{3,}$/.test(number),
  price: (price) => price > 0 && price <= 1000,
  capacity: (capacity) => capacity >= 10 && capacity <= 60
};

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Middleware para admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
  }
  next();
};

// Sistema de cache inteligente
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
};

// Función de scoring inteligente
function calculateRecommendationScore(trip) {
  let score = 0;
  
  if (trip.price < 30) score += 30;
  else if (trip.price < 50) score += 20;
  else score += 10;
  
  if (trip.available_seats > 10) score += 25;
  else if (trip.available_seats > 5) score += 15;
  else score += 5;
  
  if (trip.bus_type === 'premium') score += 20;
  else if (trip.bus_type === 'ejecutivo') score += 15;
  else score += 10;
  
  const hour = parseInt(trip.departure_time.split(':')[0]);
  if (hour >= 8 && hour <= 18) score += 15;
  else score += 5;
  
  if (trip.price_per_km && trip.price_per_km < 0.1) score += 10;
  else score += 5;
  
  return score;
}

// Generar código de reserva único
function generateReservationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BR';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// === RUTAS PRINCIPALES ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === AUTENTICACIÓN ===
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }
  
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password || '');
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
  }
  
  if (!validators.email(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  if (phone && !validators.phone(phone)) {
    return res.status(400).json({ error: 'Teléfono inválido' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El email ya existe' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign(
          { id: result.insertId, email, role: 'user' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.status(201).json({
          token,
          user: { id: result.insertId, name, email, role: 'user' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la contraseña' });
  }
});

// === BÚSQUEDA INTELIGENTE ===
app.get('/api/search', cacheMiddleware(120), (req, res) => {
  const { origin, destination, date, passengers = 1, maxPrice, busType } = req.query;
  
  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Origen, destino y fecha requeridos' });
  }
  
  let sql = `
    SELECT s.*, r.origin, r.destination, r.price, r.distance_km, r.duration_hours,
           b.number as bus_number, b.type as bus_type, b.capacity,
           (s.available_seats >= ?) as has_availability,
           CASE 
             WHEN s.available_seats >= ? THEN 'available'
             WHEN s.available_seats > 0 THEN 'limited'
             ELSE 'full'
           END as availability_status
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
    WHERE r.origin LIKE ? AND r.destination LIKE ? AND s.departure_date = ?
    AND s.available_seats > 0 AND b.status = 'activo'
  `;
  
  const params = [passengers, passengers, `%${origin}%`, `%${destination}%`, date];
  
  if (maxPrice) {
    sql += ' AND r.price <= ?';
    params.push(maxPrice);
  }
  
  if (busType) {
    sql += ' AND b.type = ?';
    params.push(busType);
  }
  
  sql += ' ORDER BY r.price ASC, s.departure_time ASC';
  
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const enhanced = results.map(trip => ({
      ...trip,
      price_per_km: trip.distance_km ? (trip.price / trip.distance_km).toFixed(2) : null,
      is_express: trip.duration_hours && trip.distance_km && (trip.distance_km / trip.duration_hours) > 80,
      comfort_level: trip.bus_type === 'premium' ? 5 : trip.bus_type === 'ejecutivo' ? 4 : 3,
      recommendation_score: calculateRecommendationScore(trip)
    }));
    
    res.json(enhanced.sort((a, b) => b.recommendation_score - a.recommendation_score));
  });
});

// === SISTEMA DE RESERVAS INTELIGENTE ===
app.post('/api/reservations', authenticateToken, (req, res) => {
  const { schedule_id, seat_number, passengers = 1 } = req.body;
  const user_id = req.user.id;
  
  if (!schedule_id || !seat_number) {
    return res.status(400).json({ error: 'Horario y número de asiento requeridos' });
  }
  
  if (passengers < 1 || passengers > 4) {
    return res.status(400).json({ error: 'Número de pasajeros inválido (1-4)' });
  }
  
  db.query(
    `SELECT s.available_seats, s.departure_date, s.departure_time, r.price, r.origin, r.destination,
            (SELECT COUNT(*) FROM reservations WHERE user_id = ? AND schedule_id = ? AND status = 'confirmada') as existing_reservation
     FROM schedules s 
     JOIN routes r ON s.route_id = r.id 
     WHERE s.id = ?`,
    [user_id, schedule_id, schedule_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }
      
      const schedule = results[0];
      
      if (schedule.existing_reservation > 0) {
        return res.status(409).json({ error: 'Ya tienes una reserva para este viaje' });
      }
      
      if (schedule.available_seats < passengers) {
        return res.status(400).json({ 
          error: `Solo hay ${schedule.available_seats} asientos disponibles` 
        });
      }
      
      const tripDate = new Date(schedule.departure_date + 'T' + schedule.departure_time);
      if (tripDate < new Date()) {
        return res.status(400).json({ error: 'No se puede reservar un viaje pasado' });
      }
      
      const totalPrice = schedule.price * passengers;
      const reservationCode = generateReservationCode();
      
      db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err.message });
        
        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            return res.status(500).json({ error: err.message });
          }
          
          connection.query(
            `INSERT INTO reservations (user_id, schedule_id, seat_number, passengers, total_price, status, reservation_code) 
             VALUES (?, ?, ?, ?, ?, 'confirmada', ?)`,
            [user_id, schedule_id, seat_number, passengers, totalPrice, reservationCode],
            (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: err.message });
                });
              }
              
              connection.query(
                'UPDATE schedules SET available_seats = available_seats - ? WHERE id = ?',
                [passengers, schedule_id],
                (err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({ error: err.message });
                    });
                  }
                  
                  connection.commit((err) => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: err.message });
                      });
                    }
                    
                    connection.release();
                    cache.flushAll();
                    
                    res.status(201).json({
                      id: result.insertId,
                      reservation_code: reservationCode,
                      message: 'Reserva creada exitosamente',
                      total_price: totalPrice,
                      passengers,
                      trip: {
                        origin: schedule.origin,
                        destination: schedule.destination,
                        date: schedule.departure_date,
                        time: schedule.departure_time
                      }
                    });
                  });
                }
              );
            }
          );
        });
      });
    }
  );
});

// === RUTAS CRUD COMPLETAS ===
app.get('/api/users', authenticateToken, requireAdmin, cacheMiddleware(60), (req, res) => {
  db.query('SELECT id, name, email, phone, role, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/buses', cacheMiddleware(300), (req, res) => {
  db.query('SELECT * FROM buses ORDER BY number', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/routes', cacheMiddleware(300), (req, res) => {
  db.query('SELECT * FROM routes ORDER BY origin, destination', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// === INICIALIZACIÓN ===
app.get('/init-db', (req, res) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255),
      phone VARCHAR(20),
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS buses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      number VARCHAR(20) UNIQUE NOT NULL,
      capacity INT NOT NULL,
      type ENUM('economico', 'ejecutivo', 'premium') DEFAULT 'economico',
      status ENUM('activo', 'mantenimiento', 'inactivo') DEFAULT 'activo'
    )`,
    `CREATE TABLE IF NOT EXISTS routes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      distance_km INT,
      duration_hours DECIMAL(3,1),
      price DECIMAL(10,2) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bus_id INT,
      route_id INT,
      departure_time TIME NOT NULL,
      arrival_time TIME NOT NULL,
      departure_date DATE NOT NULL,
      available_seats INT,
      FOREIGN KEY (bus_id) REFERENCES buses(id),
      FOREIGN KEY (route_id) REFERENCES routes(id)
    )`,
    `CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      schedule_id INT,
      seat_number INT NOT NULL,
      passengers INT DEFAULT 1,
      status ENUM('confirmada', 'cancelada', 'pendiente') DEFAULT 'pendiente',
      total_price DECIMAL(10,2),
      reservation_code VARCHAR(10),
      reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (schedule_id) REFERENCES schedules(id)
    )`
  ];
  
  let completed = 0;
  tables.forEach((sql) => {
    db.query(sql, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      completed++;
      if (completed === tables.length) {
        res.status(201).json({ message: 'Base de datos inicializada correctamente' });
      }
    });
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚌 BusReserva Pro - Sistema Inteligente`);
  console.log(`────────────────────────────────────────`);
  console.log(`🌐 Aplicación:     http://localhost:${PORT}`);
  console.log(`📊 Administración: http://localhost:${PORT}/admin.html`);
  console.log(`🔧 Inicializar BD: http://localhost:${PORT}/init-db`);
  console.log(`────────────────────────────────────────`);
  console.log(`✅ Servidor inteligente iniciado en puerto ${PORT}\n`);
});