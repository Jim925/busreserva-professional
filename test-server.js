const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

app.get('/test-db', (req, res) => {
  res.json({ message: 'Ruta test-db funcionando' });
});

app.listen(3001, () => {
  console.log('Servidor en puerto 3001');
  console.log('Prueba: http://localhost:3001/test-db');
});