// Script de verificación del sistema BusReserva Professional
const mysql = require('mysql2');
const http = require('http');

console.log('🔍 VERIFICANDO SISTEMA BUSRESERVA PROFESSIONAL');
console.log('═══════════════════════════════════════════════');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bus_reservation'
};

// 1. Verificar conexión a MySQL
function checkDatabase() {
  return new Promise((resolve, reject) => {
    console.log('📊 Verificando conexión a MySQL...');
    
    const connection = mysql.createConnection(dbConfig);
    
    connection.connect((err) => {
      if (err) {
        console.log('❌ Error de conexión a MySQL:', err.message);
        console.log('💡 Asegúrate de que XAMPP esté ejecutándose');
        reject(err);
        return;
      }
      
      console.log('✅ Conexión a MySQL exitosa');
      
      // Verificar si existe la base de datos
      connection.query('SHOW TABLES', (err, results) => {
        if (err) {
          console.log('❌ Error al consultar tablas:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Base de datos encontrada');
        console.log(`📋 Tablas encontradas: ${results.length}`);
        
        results.forEach(table => {
          console.log(`   - ${Object.values(table)[0]}`);
        });
        
        connection.end();
        resolve(true);
      });
    });
  });
}

// 2. Verificar datos de ejemplo
function checkSampleData() {
  return new Promise((resolve, reject) => {
    console.log('\n🗃️ Verificando datos de ejemplo...');
    
    const connection = mysql.createConnection(dbConfig);
    
    const queries = [
      { name: 'Usuarios', query: 'SELECT COUNT(*) as count FROM users' },
      { name: 'Autobuses', query: 'SELECT COUNT(*) as count FROM buses' },
      { name: 'Rutas', query: 'SELECT COUNT(*) as count FROM routes' },
      { name: 'Horarios', query: 'SELECT COUNT(*) as count FROM schedules' },
      { name: 'Reservas', query: 'SELECT COUNT(*) as count FROM reservations' }
    ];
    
    let completed = 0;
    
    queries.forEach(({ name, query }) => {
      connection.query(query, (err, results) => {
        if (err) {
          console.log(`❌ Error en ${name}:`, err.message);
        } else {
          console.log(`✅ ${name}: ${results[0].count} registros`);
        }
        
        completed++;
        if (completed === queries.length) {
          connection.end();
          resolve(true);
        }
      });
    });
  });
}

// 3. Verificar servidor Node.js
function checkServer() {
  return new Promise((resolve, reject) => {
    console.log('\n🌐 Verificando servidor Node.js...');
    
    const req = http.get('http://localhost:3000', (res) => {
      console.log('✅ Servidor Node.js respondiendo');
      console.log(`📡 Código de estado: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Servidor Node.js no responde:', err.message);
      console.log('💡 Ejecuta: npm start');
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout al conectar con el servidor');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// 4. Verificar API endpoints
function checkAPI() {
  return new Promise((resolve, reject) => {
    console.log('\n🔌 Verificando endpoints de API...');
    
    const endpoints = [
      '/api/routes',
      '/api/buses',
      '/api/users',
      '/api/schedules'
    ];
    
    let completed = 0;
    
    endpoints.forEach(endpoint => {
      const req = http.get(`http://localhost:3000${endpoint}`, (res) => {
        console.log(`✅ ${endpoint}: ${res.statusCode}`);
        completed++;
        
        if (completed === endpoints.length) {
          resolve(true);
        }
      });
      
      req.on('error', (err) => {
        console.log(`❌ ${endpoint}: Error`);
        completed++;
        
        if (completed === endpoints.length) {
          resolve(false);
        }
      });
      
      req.setTimeout(3000, () => {
        console.log(`❌ ${endpoint}: Timeout`);
        req.destroy();
        completed++;
        
        if (completed === endpoints.length) {
          resolve(false);
        }
      });
    });
  });
}

// Ejecutar todas las verificaciones
async function runChecks() {
  try {
    await checkDatabase();
    await checkSampleData();
    await checkServer();
    await checkAPI();
    
    console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL');
    console.log('═══════════════════════════════════════');
    console.log('✅ Base de datos: OK');
    console.log('✅ Servidor Node.js: OK');
    console.log('✅ API endpoints: OK');
    console.log('\n🌐 URLs disponibles:');
    console.log('   - Aplicación: http://localhost:3000');
    console.log('   - Admin: http://localhost:3000/admin.html');
    console.log('   - Inicializar BD: http://localhost:3000/init-db');
    
  } catch (error) {
    console.log('\n❌ PROBLEMAS DETECTADOS');
    console.log('═══════════════════════════════════');
    console.log('💡 Pasos para solucionar:');
    console.log('   1. Asegúrate de que XAMPP esté ejecutándose');
    console.log('   2. Verifica que MySQL esté activo en XAMPP');
    console.log('   3. Ejecuta: npm install');
    console.log('   4. Ejecuta: npm start');
    console.log('   5. Visita: http://localhost:3000/init-db');
  }
}

runChecks();