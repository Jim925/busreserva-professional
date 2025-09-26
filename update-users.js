const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bus_reservation'
});

console.log('🔧 Actualizando tabla de usuarios...');

const queries = [
  'ALTER TABLE users ADD COLUMN password VARCHAR(255)',
  'ALTER TABLE users ADD COLUMN google_id VARCHAR(255)',
  'ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500)',
  'ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE',
  'ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL',
  'CREATE INDEX idx_google_id ON users(google_id)'
];

let completed = 0;

queries.forEach((query, index) => {
  db.query(query, (err) => {
    if (err && !err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
      console.log(`❌ Error en query ${index + 1}:`, err.message);
    } else {
      console.log(`✅ Query ${index + 1} ejecutada`);
    }
    
    completed++;
    if (completed === queries.length) {
      console.log('✅ Tabla de usuarios actualizada');
      db.end();
    }
  });
});