const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// Conexión a MySQL XAMPP
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: ''
});

// Crear base de datos si no existe
db.query('CREATE DATABASE IF NOT EXISTS busreserva', (err) => {
  if (err) console.error('Error creando BD:', err);
  db.query('USE busreserva', (err) => {
    if (err) console.error('Error usando BD:', err);
    console.log('✅ Conectado a MySQL XAMPP - Base de datos: busreserva');
  });
});

// Crear tablas
app.get('/api/init-db', (req, res) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS routes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration VARCHAR(20)
    )`,
    `CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_name VARCHAR(100) NOT NULL,
      user_email VARCHAR(100) NOT NULL,
      route_id INT,
      seat_number INT,
      total_price DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (route_id) REFERENCES routes(id)
    )`
  ];
  
  let completed = 0;
  tables.forEach(sql => {
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
  const routes = `INSERT IGNORE INTO routes (id, origin, destination, price, duration) VALUES 
    (1, 'Lima', 'Cusco', 85.00, '22h'),
    (2, 'Lima', 'Arequipa', 65.00, '16h'),
    (3, 'Lima', 'Trujillo', 45.00, '8h'),
    (4, 'Cusco', 'Puno', 35.00, '6h')`;
  
  db.query(routes, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Base de datos inicializada correctamente' });
  });
}

// APIs
app.get('/api/routes', (req, res) => {
  db.query('SELECT * FROM routes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/reservations', (req, res) => {
  const { user_name, user_email, route_id, seat_number, total_price } = req.body;
  
  db.query(
    'INSERT INTO reservations (user_name, user_email, route_id, seat_number, total_price) VALUES (?, ?, ?, ?, ?)',
    [user_name, user_email, route_id, seat_number, total_price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'Reserva creada exitosamente' });
    }
  );
});

app.get('/api/reservations', (req, res) => {
  const sql = `
    SELECT r.*, rt.origin, rt.destination 
    FROM reservations r 
    JOIN routes rt ON r.route_id = rt.id 
    ORDER BY r.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`🚌 Backend API corriendo en http://localhost:${PORT}`);
  console.log(`📊 Inicializar BD: http://localhost:${PORT}/api/init-db`);
  console.log(`🗄️ Ver BD en: http://localhost:8080/phpmyadmin`);
});