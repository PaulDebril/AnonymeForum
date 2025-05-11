const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, bienvenue sur API de PAULD' });
});

module.exports = app;
