// Script para crear la base de datos automáticamente
const mysql = require('mysql2');
const fs = require('fs');

console.log('🔧 CONFIGURANDO BASE DE DATOS BUSRESERVA');
console.log('═══════════════════════════════════════');

// Crear conexión sin especificar base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: ''
});

connection.connect((err) => {
  if (err) {
    console.log('❌ Error de conexión a MySQL:', err.message);
    console.log('💡 Asegúrate de que XAMPP esté ejecutándose y MySQL activo');
    process.exit(1);
  }
  
  console.log('✅ Conectado a MySQL');
  
  // Crear base de datos
  connection.query('CREATE DATABASE IF NOT EXISTS bus_reservation', (err) => {
    if (err) {
      console.log('❌ Error creando base de datos:', err.message);
      process.exit(1);
    }
    
    console.log('✅ Base de datos creada/verificada');
    
    // Usar la base de datos
    connection.query('USE bus_reservation', (err) => {
      if (err) {
        console.log('❌ Error seleccionando base de datos:', err.message);
        process.exit(1);
      }
      
      console.log('✅ Base de datos seleccionada');
      
      // Leer y ejecutar el archivo SQL
      const sqlScript = fs.readFileSync('database.sql', 'utf8');
      
      // Dividir el script en comandos individuales
      const commands = sqlScript.split(';').filter(cmd => cmd.trim().length > 0);
      
      let completed = 0;
      let errors = 0;
      
      console.log(`📋 Ejecutando ${commands.length} comandos SQL...`);
      
      commands.forEach((command, index) => {
        connection.query(command, (err) => {
          if (err && !err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
            console.log(`❌ Error en comando ${index + 1}:`, err.message);
            errors++;
          }
          
          completed++;
          
          if (completed === commands.length) {
            console.log(`\n✅ Configuración completada`);
            console.log(`📊 Comandos ejecutados: ${completed}`);
            console.log(`⚠️ Errores: ${errors}`);
            
            if (errors === 0) {
              console.log('\n🎉 BASE DE DATOS CONFIGURADA EXITOSAMENTE');
              console.log('═══════════════════════════════════════════');
              console.log('✅ Todas las tablas creadas');
              console.log('✅ Datos de ejemplo insertados');
              console.log('✅ Vistas y procedimientos creados');
              console.log('\n🚀 Ahora puedes ejecutar: npm start');
            }
            
            connection.end();
          }
        });
      });
    });
  });
});