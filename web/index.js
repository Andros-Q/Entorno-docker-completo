const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

app.get('/', (req, res) => {
  res.json({ mensaje: '¡Hola! La API de Node.js está viva y coleando.' });
});

app.get('/db-status', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ status: '¡Conectado a la base de datos!', hora_bd: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Ups, no me pude conectar a la BD', detalles: err.message });
  }
});

app.listen(port, () => {
  console.log(`API escuchando en puerto ${port}`);
});
