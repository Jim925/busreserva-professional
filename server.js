require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
const JWT_SECRET = 'busreserva_secret_key_2024';

// Sistema de notificaciones en tiempo real
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Configuración de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'busreserva@gmail.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.static('public'));
app.use(session({
  secret: 'busreserva_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bus_reservation'
});

// Manejar errores de conexión
db.on('error', (err) => {
  console.error('Error de conexión a la base de datos:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconectando...');
  }
});

// Configuración de Passport
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '123456789-abcdefghijklmnop.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOCSPX-abcdefghijklmnopqrstuvwxyz',
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  db.query('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, results) => {
    if (err) return done(err);
    
    if (results.length > 0) {
      db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [results[0].id]);
      return done(null, results[0]);
    } else {
      const userData = {
        name: profile.displayName,
        email: profile.emails[0].value,
        google_id: profile.id,
        profile_picture: profile.photos[0].value,
        is_verified: true
      };
      
      db.query(
        'INSERT INTO users (name, email, google_id, profile_picture, is_verified) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, userData.google_id, userData.profile_picture, userData.is_verified],
        (err, result) => {
          if (err) return done(err);
          userData.id = result.insertId;
          return done(null, userData);
        }
      );
    }
  });
}));

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return done(err);
    if (results.length === 0) {
      return done(null, false, { message: 'Email no encontrado' });
    }
    
    const user = results[0];
    if (!user.password) {
      return done(null, false, { message: 'Inicia sesión con Google' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Contraseña incorrecta' });
    }
    
    db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    return done(null, user);
  });
}));

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Ruta básica - Servir página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para probar BD
app.get('/test-db', (req, res) => {
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error de conexión', details: err.message });
    }
    res.json({ message: 'Conexión a MySQL exitosa', result: results[0] });
  });
});

// Inicializar base de datos
app.get('/init-db', (req, res) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255),
      phone VARCHAR(20),
      google_id VARCHAR(100),
      profile_picture VARCHAR(500),
      is_verified BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMP NULL,
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
      status ENUM('confirmada', 'cancelada', 'pendiente') DEFAULT 'pendiente',
      total_price DECIMAL(10,2),
      reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (schedule_id) REFERENCES schedules(id)
    )`
  ];
  
  let completed = 0;
  tables.forEach((sql, index) => {
    db.query(sql, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      completed++;
      if (completed === tables.length) {
        insertSampleData(res);
      }
    });
  });
});

function insertSampleData(res) {
  const sampleData = [
    `INSERT IGNORE INTO buses (number, capacity, type) VALUES 
      ('BUS001', 40, 'economico'),
      ('BUS002', 35, 'ejecutivo'),
      ('BUS003', 30, 'premium')`,
    `INSERT IGNORE INTO routes (origin, destination, distance_km, duration_hours, price) VALUES 
      ('Madrid', 'Barcelona', 620, 6.5, 45.00),
      ('Madrid', 'Valencia', 350, 3.5, 30.00),
      ('Barcelona', 'Sevilla', 900, 9.0, 65.00)`,
    `INSERT IGNORE INTO schedules (bus_id, route_id, departure_time, arrival_time, departure_date, available_seats) VALUES 
      (1, 1, '08:00:00', '14:30:00', CURDATE(), 40),
      (2, 2, '10:00:00', '13:30:00', CURDATE(), 35),
      (3, 3, '22:00:00', '07:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 30)`
  ];
  
  let completed = 0;
  sampleData.forEach(sql => {
    db.query(sql, (err) => {
      completed++;
      if (completed === sampleData.length) {
        res.status(201).json({ message: 'Base de datos inicializada correctamente' });
      }
    });
  });
}

// === RUTAS DE USUARIOS ===
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/users', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email requeridos' });
  }
  
  db.query('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El email ya existe' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, name, email, phone });
  });
});

app.put('/api/users/:id', (req, res) => {
  const { name, email, phone } = req.body;
  const userId = req.params.id;
  
  db.query(
    'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, userId],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El email ya existe' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario actualizado exitosamente' });
    }
  );
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  });
});

// === RUTAS DE BÚSQUEDA ===
app.get('/api/search', (req, res) => {
  const { origin, destination, date } = req.query;
  
  const sql = `
    SELECT s.*, r.origin, r.destination, r.price, b.number as bus_number, b.type as bus_type
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
    WHERE r.origin LIKE ? AND r.destination LIKE ? AND s.departure_date = ?
    AND s.available_seats > 0
  `;
  
  db.query(sql, [`%${origin}%`, `%${destination}%`, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// === RUTAS DE RESERVAS ===
app.post('/api/reservations', authenticateToken, (req, res) => {
  const { user_id, schedule_id, seat_number } = req.body;
  
  if (!user_id || !schedule_id || !seat_number) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  
  // Verificar disponibilidad
  db.query('SELECT available_seats FROM schedules WHERE id = ?', [schedule_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0 || results[0].available_seats <= 0) {
      return res.status(400).json({ error: 'No hay asientos disponibles' });
    }
    
    // Obtener precio
    const priceSql = `
      SELECT r.price FROM schedules s
      JOIN routes r ON s.route_id = r.id
      WHERE s.id = ?
    `;
    
    db.query(priceSql, [schedule_id], (err, priceResults) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const price = priceResults[0].price;
      
      // Crear reserva
      db.query(
        'INSERT INTO reservations (user_id, schedule_id, seat_number, total_price, status) VALUES (?, ?, ?, ?, "confirmada")',
        [user_id, schedule_id, seat_number, price],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          
          // Actualizar asientos disponibles
          db.query(
            'UPDATE schedules SET available_seats = available_seats - 1 WHERE id = ?',
            [schedule_id],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({ 
                id: result.insertId, 
                message: 'Reserva creada exitosamente',
                total_price: price
              });
            }
          );
        }
      );
    });
  });
});

app.get('/api/reservations/:userId', authenticateToken, (req, res) => {
  const sql = `
    SELECT res.*, s.departure_time, s.departure_date, r.origin, r.destination, b.number as bus_number
    FROM reservations res
    JOIN schedules s ON res.schedule_id = s.id
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
    WHERE res.user_id = ?
    ORDER BY res.reservation_date DESC
  `;
  
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// === RUTAS DE ADMINISTRACIÓN ===
app.get('/api/admin/stats', (req, res) => {
  const stats = {};
  
  db.query('SELECT COUNT(*) as total FROM reservations WHERE status = "confirmada"', (err, results) => {
    stats.total_reservations = results[0].total;
    
    db.query('SELECT SUM(total_price) as revenue FROM reservations WHERE status = "confirmada"', (err, results) => {
      stats.total_revenue = results[0].revenue || 0;
      
      db.query('SELECT COUNT(*) as total FROM users', (err, results) => {
        stats.total_users = results[0].total;
        res.json(stats);
      });
    });
  });
});

// === RUTAS DE AUTOBUSES ===
app.get('/api/buses', (req, res) => {
  db.query('SELECT * FROM buses ORDER BY number', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/buses', (req, res) => {
  const { number, capacity, type } = req.body;
  if (!number || !capacity) {
    return res.status(400).json({ error: 'Número y capacidad requeridos' });
  }
  
  db.query('INSERT INTO buses (number, capacity, type) VALUES (?, ?, ?)', [number, capacity, type], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El número de autobús ya existe' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, number, capacity, type });
  });
});

app.put('/api/buses/:id', (req, res) => {
  const { number, capacity, type, status } = req.body;
  const busId = req.params.id;
  
  db.query(
    'UPDATE buses SET number = ?, capacity = ?, type = ?, status = ? WHERE id = ?',
    [number, capacity, type, status, busId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Autobús no encontrado' });
      }
      res.json({ message: 'Autobús actualizado exitosamente' });
    }
  );
});

app.delete('/api/buses/:id', (req, res) => {
  const busId = req.params.id;
  
  db.query('DELETE FROM buses WHERE id = ?', [busId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Autobús no encontrado' });
    }
    res.json({ message: 'Autobús eliminado exitosamente' });
  });
});

// === RUTAS DE RUTAS ===
app.get('/api/routes', (req, res) => {
  db.query('SELECT * FROM routes ORDER BY origin, destination', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/routes', (req, res) => {
  const { origin, destination, distance_km, duration_hours, price } = req.body;
  if (!origin || !destination || !price) {
    return res.status(400).json({ error: 'Origen, destino y precio requeridos' });
  }
  
  db.query(
    'INSERT INTO routes (origin, destination, distance_km, duration_hours, price) VALUES (?, ?, ?, ?, ?)',
    [origin, destination, distance_km, duration_hours, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, origin, destination, distance_km, duration_hours, price });
    }
  );
});

app.put('/api/routes/:id', (req, res) => {
  const { origin, destination, distance_km, duration_hours, price } = req.body;
  const routeId = req.params.id;
  
  db.query(
    'UPDATE routes SET origin = ?, destination = ?, distance_km = ?, duration_hours = ?, price = ? WHERE id = ?',
    [origin, destination, distance_km, duration_hours, price, routeId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Ruta no encontrada' });
      }
      res.json({ message: 'Ruta actualizada exitosamente' });
    }
  );
});

app.delete('/api/routes/:id', (req, res) => {
  const routeId = req.params.id;
  
  db.query('DELETE FROM routes WHERE id = ?', [routeId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json({ message: 'Ruta eliminada exitosamente' });
  });
});

// === RUTAS DE HORARIOS ===
app.get('/api/schedules', (req, res) => {
  const sql = `
    SELECT s.*, r.origin, r.destination, b.number as bus_number, b.type as bus_type
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
    ORDER BY s.departure_date, s.departure_time
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/schedules', (req, res) => {
  const { bus_id, route_id, departure_time, arrival_time, departure_date } = req.body;
  if (!bus_id || !route_id || !departure_time || !arrival_time || !departure_date) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  // Obtener capacidad del autobús
  db.query('SELECT capacity FROM buses WHERE id = ?', [bus_id], (err, busResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (busResults.length === 0) {
      return res.status(400).json({ error: 'Autobús no encontrado' });
    }
    
    const capacity = busResults[0].capacity;
    
    db.query(
      'INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, departure_date, available_seats) VALUES (?, ?, ?, ?, ?, ?)',
      [bus_id, route_id, departure_time, arrival_time, departure_date, capacity],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, message: 'Horario creado exitosamente' });
      }
    );
  });
});

app.put('/api/schedules/:id', (req, res) => {
  const { bus_id, route_id, departure_time, arrival_time, departure_date } = req.body;
  const scheduleId = req.params.id;
  
  db.query(
    'UPDATE schedules SET bus_id = ?, route_id = ?, departure_time = ?, arrival_time = ?, departure_date = ? WHERE id = ?',
    [bus_id, route_id, departure_time, arrival_time, departure_date, scheduleId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }
      res.json({ message: 'Horario actualizado exitosamente' });
    }
  );
});

app.delete('/api/schedules/:id', (req, res) => {
  const scheduleId = req.params.id;
  
  db.query('DELETE FROM schedules WHERE id = ?', [scheduleId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    res.json({ message: 'Horario eliminado exitosamente' });
  });
});

// === GESTIÓN DE RESERVAS ADMIN ===
app.get('/api/admin/reservations', (req, res) => {
  const sql = `
    SELECT res.*, u.name as user_name, u.email, s.departure_time, s.departure_date, 
           r.origin, r.destination, b.number as bus_number
    FROM reservations res
    JOIN users u ON res.user_id = u.id
    JOIN schedules s ON res.schedule_id = s.id
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
    ORDER BY res.reservation_date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/reservations/:id/cancel', (req, res) => {
  const reservationId = req.params.id;
  
  // Obtener información de la reserva
  db.query('SELECT schedule_id FROM reservations WHERE id = ?', [reservationId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    const scheduleId = results[0].schedule_id;
    
    // Cancelar reserva
    db.query('UPDATE reservations SET status = "cancelada" WHERE id = ?', [reservationId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Liberar asiento
      db.query('UPDATE schedules SET available_seats = available_seats + 1 WHERE id = ?', [scheduleId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Reserva cancelada exitosamente' });
      });
    });
  });
});

// === RUTAS ADICIONALES ===
app.get('/api/cities', (req, res) => {
  const sql = `
    SELECT DISTINCT origin as city FROM routes
    UNION
    SELECT DISTINCT destination as city FROM routes
    ORDER BY city
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(row => row.city));
  });
});

// Crear base de datos si no existe
app.get('/create-database', (req, res) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ''
  });
  
  connection.query('CREATE DATABASE IF NOT EXISTS bus_reservation', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    connection.end();
    res.json({ message: 'Base de datos creada exitosamente' });
  });
});

// === RUTAS DE AUTENTICACIÓN ===

// Registro tradicional
app.post('/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  try {
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (results.length > 0) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.query(
        'INSERT INTO users (name, email, password, phone, is_verified) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone, false],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          
          const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '24h' });
          
          res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: result.insertId, name, email, phone }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login tradicional
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: info.message });
    
    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profile_picture: user.profile_picture
        }
      });
    });
  })(req, res, next);
});

// Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth.html' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profile_picture: req.user.profile_picture
    }))}`);
  }
);

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});

// Verificar token
app.get('/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.query('SELECT id, name, email, phone, profile_picture FROM users WHERE id = ?', [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json({ user: results[0] });
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// === FUNCIONALIDADES AVANZADAS ===

// Geolocalización y rutas inteligentes
app.get('/api/nearby-stations', (req, res) => {
  const { lat, lng, radius = 10 } = req.query;
  
  const sql = `
    SELECT DISTINCT origin as station, 
           (6371 * acos(cos(radians(?)) * cos(radians(40.4168)) * cos(radians(-3.7038) - radians(?)) + sin(radians(?)) * sin(radians(40.4168)))) AS distance
    FROM routes
    HAVING distance < ?
    ORDER BY distance
    LIMIT 10
  `;
  
  db.query(sql, [lat, lng, lat, radius], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Analytics avanzados
app.get('/api/analytics/popular-routes', (req, res) => {
  const sql = `
    SELECT r.origin, r.destination, COUNT(*) as bookings, AVG(r.price) as avg_price
    FROM reservations res
    JOIN schedules s ON res.schedule_id = s.id
    JOIN routes r ON s.route_id = r.id
    WHERE res.status = 'confirmada' AND res.reservation_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY r.origin, r.destination
    ORDER BY bookings DESC
    LIMIT 10
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Predicción de precios
app.get('/api/price-prediction/:routeId', (req, res) => {
  const routeId = req.params.routeId;
  
  const sql = `
    SELECT 
      AVG(r.price) as current_price,
      COUNT(res.id) as demand,
      AVG(s.available_seats) as avg_availability
    FROM routes r
    LEFT JOIN schedules s ON r.id = s.route_id
    LEFT JOIN reservations res ON s.id = res.schedule_id AND res.reservation_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    WHERE r.id = ?
    GROUP BY r.id
  `;
  
  db.query(sql, [routeId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length > 0) {
      const data = results[0];
      const demandFactor = data.demand > 10 ? 1.2 : data.demand > 5 ? 1.1 : 1.0;
      const availabilityFactor = data.avg_availability < 10 ? 1.15 : 1.0;
      
      const predictedPrice = data.current_price * demandFactor * availabilityFactor;
      
      res.json({
        current_price: data.current_price,
        predicted_price: predictedPrice.toFixed(2),
        demand_level: data.demand > 10 ? 'high' : data.demand > 5 ? 'medium' : 'low',
        recommendation: predictedPrice > data.current_price ? 'book_now' : 'wait'
      });
    } else {
      res.json({ error: 'Route not found' });
    }
  });
});

// Sistema de notificaciones
app.post('/api/notifications/subscribe', (req, res) => {
  const { user_id, route_id, price_threshold } = req.body;
  
  db.query(
    'INSERT INTO price_alerts (user_id, route_id, price_threshold) VALUES (?, ?, ?)',
    [user_id, route_id, price_threshold],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Alerta de precio configurada' });
    }
  );
});

// Recomendaciones personalizadas
app.get('/api/recommendations/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT r.*, COUNT(*) as frequency
    FROM reservations res
    JOIN schedules s ON res.schedule_id = s.id
    JOIN routes r ON s.route_id = r.id
    WHERE res.user_id = ? AND res.status = 'confirmada'
    GROUP BY r.origin, r.destination
    ORDER BY frequency DESC
    LIMIT 5
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// === APIS DE IMÁGENES ===

// Obtener imágenes por categoría
app.get('/api/images/category/:category', (req, res) => {
  const { category } = req.params;
  const { count = 6 } = req.query;
  
  const categories = {
    hero: [
      { id: 'hero1', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80', alt: 'Autobús profesional', author: 'Unsplash' },
      { id: 'hero2', url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80', alt: 'Terminal moderna', author: 'Unsplash' }
    ],
    buses: [
      { id: 'bus1', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', alt: 'Autobús moderno', author: 'Unsplash' },
      { id: 'bus2', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', alt: 'Interior de autobús', author: 'Unsplash' },
      { id: 'bus3', url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80', alt: 'Terminal de autobuses', author: 'Unsplash' }
    ],
    services: [
      { id: 'service1', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80', alt: 'Equipaje de viaje', author: 'Unsplash' },
      { id: 'service2', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80', alt: 'Carretera segura', author: 'Unsplash' },
      { id: 'service3', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80', alt: 'Paisaje de viaje', author: 'Unsplash' }
    ],
    cities: [
      { id: 'city1', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80', alt: 'Ciudad moderna', author: 'Unsplash' },
      { id: 'city2', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80', alt: 'Estación de transporte', author: 'Unsplash' },
      { id: 'city3', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=600&q=80', alt: 'Transporte urbano', author: 'Unsplash' }
    ],
    testimonials: [
      { id: 'test1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', alt: 'Cliente satisfecho', author: 'Unsplash' },
      { id: 'test2', url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&q=80', alt: 'Usuaria feliz', author: 'Unsplash' },
      { id: 'test3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80', alt: 'Viajero contento', author: 'Unsplash' }
    ]
  };
  
  const images = categories[category] || categories.services;
  res.json(images.slice(0, parseInt(count)));
});

// Obtener imagen aleatoria por tema
app.get('/api/images/random/:theme', (req, res) => {
  const { theme } = req.params;
  
  const themes = {
    transport: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80'
    ],
    travel: [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'
    ],
    city: [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&q=80'
    ]
  };
  
  const urls = themes[theme] || themes.transport;
  const randomUrl = urls[Math.floor(Math.random() * urls.length)];
  
  res.json({ url: randomUrl, alt: `Imagen de ${theme}` });
});

// Tareas programadas
cron.schedule('0 9 * * *', () => {
  // Enviar recordatorios de viaje
  const sql = `
    SELECT res.*, u.email, u.name, s.departure_date, s.departure_time, r.origin, r.destination
    FROM reservations res
    JOIN users u ON res.user_id = u.id
    JOIN schedules s ON res.schedule_id = s.id
    JOIN routes r ON s.route_id = r.id
    WHERE res.status = 'confirmada' AND s.departure_date = CURDATE() + INTERVAL 1 DAY
  `;
  
  db.query(sql, (err, results) => {
    if (!err && results.length > 0) {
      results.forEach(reservation => {
        const mailOptions = {
          from: 'busreserva@gmail.com',
          to: reservation.email,
          subject: 'Recordatorio de Viaje - BusReserva Pro',
          html: `
            <h2>¡Tu viaje es mañana!</h2>
            <p>Hola ${reservation.name},</p>
            <p>Te recordamos que tienes un viaje programado:</p>
            <ul>
              <li><strong>Ruta:</strong> ${reservation.origin} → ${reservation.destination}</li>
              <li><strong>Fecha:</strong> ${reservation.departure_date}</li>
              <li><strong>Hora:</strong> ${reservation.departure_time}</li>
              <li><strong>Asiento:</strong> ${reservation.seat_number}</li>
            </ul>
            <p>¡Buen viaje!</p>
          `
        };
        
        transporter.sendMail(mailOptions);
      });
    }
  });
});

// Proxy para imágenes (evitar CORS)
app.get('/api/image-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL requerida' });
    
    res.set('Cache-Control', 'public, max-age=86400');
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar imagen' });
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor con WebSocket
server.listen(PORT, () => {
  console.log(`\n🚌 BusReserva Pro - Sistema Inteligente Avanzado`);
  console.log(`────────────────────────────────────────────────`);
  console.log(`🌐 Aplicación:        http://localhost:${PORT}`);
  console.log(`📊 Administración:    http://localhost:${PORT}/admin.html`);
  console.log(`🔧 Inicializar BD:    http://localhost:${PORT}/init-db`);
  console.log(`🗄️ Crear BD:          http://localhost:${PORT}/create-database`);
  console.log(`🔌 WebSocket:         ws://localhost:${PORT}`);
  console.log(`────────────────────────────────────────────────`);
  console.log(`✅ Servidor avanzado iniciado en puerto ${PORT}`);
  console.log(`🚀 Funcionalidades: WebSocket, Geolocalización, Analytics, Notificaciones\n`);
});