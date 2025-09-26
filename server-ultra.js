const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const WebSocket = require('ws');
const http = require('http');
const Redis = require('redis');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ultra_secret_key_2024';

// Redis para caché
const redis = Redis.createClient();
redis.connect();

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});
app.use('/api/', limiter);

// Configuración MySQL con pool
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bus_reservation_ultra',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

const db = mysql.createPool(dbConfig);

// Configuración de email
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'busreserva@gmail.com',
    pass: 'app_password_here'
  }
});

// Configuración de archivos
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5000000 } });

// Middleware de autenticación
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

// WebSocket para tiempo real
wss.on('connection', (ws) => {
  console.log('Cliente conectado via WebSocket');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'subscribe_route') {
        ws.routeId = data.routeId;
        ws.send(JSON.stringify({ type: 'subscribed', routeId: data.routeId }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Mensaje inválido' }));
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Función para broadcast
const broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// === AUTENTICACIÓN AVANZADA ===
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('name').isLength({ min: 2 }).trim().escape(),
  body('phone').isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;
    
    // Verificar si el usuario existe
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear usuario
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, created_at, email_verified) VALUES (?, ?, ?, ?, NOW(), 0)',
      [name, email, hashedPassword, phone]
    );

    // Generar token de verificación
    const verificationToken = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '24h' });
    
    // Enviar email de verificación
    const mailOptions = {
      from: 'busreserva@gmail.com',
      to: email,
      subject: 'Verifica tu cuenta - BusReserva Ultra',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007AFF; text-align: center;">¡Bienvenido a BusReserva Ultra!</h1>
          <p>Hola ${name},</p>
          <p>Gracias por registrarte. Haz clic en el botón para verificar tu cuenta:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:${PORT}/verify-email?token=${verificationToken}" 
               style="background: linear-gradient(135deg, #007AFF, #5856D6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
              Verificar Cuenta
            </a>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
      message: 'Usuario registrado. Verifica tu email para activar la cuenta.',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    const [users] = await db.execute(
      'SELECT id, name, email, password, role, email_verified, last_login FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    
    if (!user.email_verified) {
      return res.status(401).json({ error: 'Email no verificado. Revisa tu bandeja de entrada.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generar tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Guardar refresh token
    await redis.setEx(`refresh_token:${user.id}`, 604800, refreshToken);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === BÚSQUEDA INTELIGENTE ===
app.get('/api/search/intelligent', async (req, res) => {
  try {
    const { origin, destination, date, passengers = 1, flexible = false } = req.query;
    
    let cacheKey = `search:${origin}:${destination}:${date}:${passengers}:${flexible}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    let dateCondition = 'DATE(s.departure_date) = ?';
    let params = [origin, destination, date];
    
    if (flexible === 'true') {
      dateCondition = 'DATE(s.departure_date) BETWEEN ? AND DATE_ADD(?, INTERVAL 3 DAY)';
      params = [origin, destination, date, date];
    }

    const sql = `
      SELECT 
        s.id, s.departure_time, s.departure_date, s.available_seats, s.price,
        r.origin, r.destination, r.duration, r.distance,
        b.number as bus_number, b.type as bus_type, b.amenities,
        CASE 
          WHEN s.available_seats < 5 THEN 'low'
          WHEN s.available_seats < 15 THEN 'medium'
          ELSE 'high'
        END as availability_level,
        (SELECT AVG(rating) FROM reviews WHERE schedule_id = s.id) as avg_rating,
        (SELECT COUNT(*) FROM reservations WHERE schedule_id = s.id AND status = 'confirmada') as total_bookings
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      WHERE r.origin = ? AND r.destination = ? AND ${dateCondition}
        AND s.available_seats >= ? AND s.departure_date >= CURDATE()
      ORDER BY s.departure_date, s.departure_time
    `;
    
    params.push(passengers);
    const [results] = await db.execute(sql, params);
    
    // Enriquecer resultados con predicciones
    const enrichedResults = await Promise.all(results.map(async (schedule) => {
      const prediction = await getPricePrediction(schedule.id);
      return {
        ...schedule,
        price_prediction: prediction,
        amenities: JSON.parse(schedule.amenities || '[]'),
        recommendation_score: calculateRecommendationScore(schedule)
      };
    }));

    // Cachear por 5 minutos
    await redis.setEx(cacheKey, 300, JSON.stringify(enrichedResults));
    
    res.json(enrichedResults);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

// === RESERVAS AVANZADAS ===
app.post('/api/reservations/create', authenticateToken, [
  body('schedule_id').isInt(),
  body('passengers').isInt({ min: 1, max: 10 }),
  body('seat_preferences').optional().isArray()
], async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { schedule_id, passengers, seat_preferences = [], payment_method = 'pending' } = req.body;
    const userId = req.user.userId;

    // Verificar disponibilidad
    const [schedules] = await connection.execute(
      'SELECT available_seats, price FROM schedules WHERE id = ? FOR UPDATE',
      [schedule_id]
    );

    if (schedules.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    if (schedules[0].available_seats < passengers) {
      await connection.rollback();
      return res.status(400).json({ error: 'No hay suficientes asientos disponibles' });
    }

    // Crear reserva
    const totalPrice = schedules[0].price * passengers;
    const reservationCode = generateReservationCode();
    
    const [reservation] = await connection.execute(
      `INSERT INTO reservations (user_id, schedule_id, passengers, total_price, 
       reservation_code, status, payment_method, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW())`,
      [userId, schedule_id, passengers, totalPrice, reservationCode, payment_method]
    );

    // Actualizar asientos disponibles
    await connection.execute(
      'UPDATE schedules SET available_seats = available_seats - ? WHERE id = ?',
      [passengers, schedule_id]
    );

    // Asignar asientos
    const seatNumbers = await assignSeats(connection, schedule_id, passengers, seat_preferences);
    
    for (const seatNumber of seatNumbers) {
      await connection.execute(
        'INSERT INTO reservation_seats (reservation_id, seat_number) VALUES (?, ?)',
        [reservation.insertId, seatNumber]
      );
    }

    await connection.commit();

    // Notificar via WebSocket
    broadcast({
      type: 'seat_update',
      schedule_id,
      available_seats: schedules[0].available_seats - passengers
    });

    // Enviar email de confirmación
    await sendReservationEmail(userId, reservation.insertId, 'created');

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reservation_id: reservation.insertId,
      reservation_code: reservationCode,
      seats: seatNumbers,
      total_price: totalPrice
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creando reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// === FUNCIONES AUXILIARES ===
const getPricePrediction = async (scheduleId) => {
  try {
    const [results] = await db.execute(`
      SELECT 
        s.price as current_price,
        COUNT(r.id) as recent_bookings,
        s.available_seats,
        (SELECT COUNT(*) FROM reservations WHERE schedule_id = s.id) as total_bookings
      FROM schedules s
      LEFT JOIN reservations r ON s.id = r.schedule_id AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      WHERE s.id = ?
      GROUP BY s.id
    `, [scheduleId]);

    if (results.length === 0) return null;

    const data = results[0];
    const demandFactor = data.recent_bookings > 5 ? 1.15 : data.recent_bookings > 2 ? 1.05 : 1.0;
    const availabilityFactor = data.available_seats < 10 ? 1.1 : 1.0;
    
    return {
      current: data.current_price,
      predicted: (data.current_price * demandFactor * availabilityFactor).toFixed(2),
      trend: demandFactor > 1.05 ? 'increasing' : 'stable'
    };
  } catch (error) {
    return null;
  }
};

const calculateRecommendationScore = (schedule) => {
  let score = 0;
  
  // Puntuación por disponibilidad
  if (schedule.availability_level === 'high') score += 30;
  else if (schedule.availability_level === 'medium') score += 20;
  else score += 10;
  
  // Puntuación por rating
  if (schedule.avg_rating) score += schedule.avg_rating * 10;
  
  // Puntuación por popularidad
  if (schedule.total_bookings > 50) score += 20;
  else if (schedule.total_bookings > 20) score += 10;
  
  return Math.min(100, score);
};

const generateReservationCode = () => {
  return 'BR' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
};

const assignSeats = async (connection, scheduleId, passengers, preferences) => {
  const [occupiedSeats] = await connection.execute(
    'SELECT seat_number FROM reservation_seats rs JOIN reservations r ON rs.reservation_id = r.id WHERE r.schedule_id = ? AND r.status != "cancelada"',
    [scheduleId]
  );
  
  const occupied = occupiedSeats.map(s => s.seat_number);
  const available = [];
  
  for (let i = 1; i <= 50; i++) {
    if (!occupied.includes(i)) available.push(i);
  }
  
  return available.slice(0, passengers);
};

const sendReservationEmail = async (userId, reservationId, type) => {
  try {
    const [results] = await db.execute(`
      SELECT r.*, u.name, u.email, s.departure_date, s.departure_time,
             rt.origin, rt.destination, b.number as bus_number
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN schedules s ON r.schedule_id = s.id
      JOIN routes rt ON s.route_id = rt.id
      JOIN buses b ON s.bus_id = b.id
      WHERE r.id = ?
    `, [reservationId]);

    if (results.length === 0) return;

    const reservation = results[0];
    
    const mailOptions = {
      from: 'busreserva@gmail.com',
      to: reservation.email,
      subject: `Reserva ${type === 'created' ? 'Confirmada' : 'Actualizada'} - ${reservation.reservation_code}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007AFF;">BusReserva Ultra</h1>
          <h2>Reserva ${type === 'created' ? 'Confirmada' : 'Actualizada'}</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Código:</strong> ${reservation.reservation_code}</p>
            <p><strong>Ruta:</strong> ${reservation.origin} → ${reservation.destination}</p>
            <p><strong>Fecha:</strong> ${reservation.departure_date}</p>
            <p><strong>Hora:</strong> ${reservation.departure_time}</p>
            <p><strong>Autobús:</strong> ${reservation.bus_number}</p>
            <p><strong>Pasajeros:</strong> ${reservation.passengers}</p>
            <p><strong>Total:</strong> $${reservation.total_price}</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando email:', error);
  }
};

// === INICIALIZACIÓN ===
app.get('/init-db-ultra', async (req, res) => {
  try {
    const initSQL = await fs.readFile('./database-ultra.sql', 'utf8');
    const statements = initSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement);
      }
    }
    
    res.json({ message: 'Base de datos ultra inicializada exitosamente' });
  } catch (error) {
    console.error('Error inicializando BD:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tareas programadas
cron.schedule('*/5 * * * *', async () => {
  // Limpiar tokens expirados
  const expiredTokens = await redis.keys('refresh_token:*');
  for (const key of expiredTokens) {
    const ttl = await redis.ttl(key);
    if (ttl < 0) await redis.del(key);
  }
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`\n🚀 BusReserva Ultra - Sistema de Nueva Generación`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`🌐 Aplicación:        http://localhost:${PORT}`);
  console.log(`🔐 API Segura:        http://localhost:${PORT}/api`);
  console.log(`📊 Admin Ultra:       http://localhost:${PORT}/admin-ultra.html`);
  console.log(`🗄️ Inicializar BD:    http://localhost:${PORT}/init-db-ultra`);
  console.log(`🔌 WebSocket:         ws://localhost:${PORT}`);
  console.log(`⚡ Redis Cache:       Activo`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`✅ Servidor Ultra iniciado con todas las características avanzadas`);
  console.log(`🚀 JWT Auth | Redis Cache | WebSocket | Email | Cron Jobs | Rate Limiting\n`);
});