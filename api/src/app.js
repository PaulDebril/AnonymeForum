const express = require('express');
const cors = require('cors');
const db = require('./db');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Forum Anonyme',
      version: '1.0.0',
      description: 'Doc pour /hello, /health, /messages'
    }
  },
  apis: ['./src/app.js']
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Vérifie si l’API fonctionne
 *     responses:
 *       200:
 *         description: Message de bienvenue
 */
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, bienvenue sur API de PAULD' });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérifie la connexion à la base de données
 *     responses:
 *       200:
 *         description: Connexion à la base réussie
 *       500:
 *         description: Erreur de connexion à la base
 */
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'OK', message: 'Connexion à la base réussie' });
  } catch (err) {
    console.error('Erreur de connexion à la base :', err);
    res.status(500).json({ status: 'KO', message: 'Erreur de connexion à la base de données' });
  }
});

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Crée un nouveau message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *               contenu:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message créé
 *       500:
 *         description: Erreur lors de la création
 */
app.post('/messages', async (req, res) => {
  const { pseudo, contenu } = req.body;
  if (!pseudo || !contenu) {
    return res.status(400).json({ error: 'pseudo et contenu sont requis' });
  }
  try {
    const result = await db.query(
      'INSERT INTO message(pseudo, contenu) VALUES($1, $2) RETURNING *',
      [pseudo, contenu]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur insertion message :', err);
    res.status(500).json({ error: "Erreur lors de l'insertion du message" });
  }
});

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Récupère tous les messages
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   pseudo:
 *                     type: string
 *                   contenu:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 */
app.get('/messages', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, pseudo, contenu, date FROM message ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération messages :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Supprime un message par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Message supprimé
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.delete('/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM message WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    res.json({ status: 'OK', message: 'Message supprimé' });
  } catch (err) {
    console.error('Erreur suppression message :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du message' });
  }
});

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     summary: Récupère un message par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Message trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 pseudo:
 *                   type: string
 *                 contenu:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.get('/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT id, pseudo, contenu, date FROM message WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur récupération message :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du message' });
  }
});

module.exports = app;
