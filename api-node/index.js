const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('¡Hola! La API de Node.js está viva y coleando. ');
});

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
