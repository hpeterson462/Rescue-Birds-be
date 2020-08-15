const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

app.use('/auth', authRoutes);

app.use('/api', ensureAuth);

app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/birds', async (req, res) => {
  const data = await client.query(`SELECT birds.id, number_of_eggs, flies, color, birds.name AS rescue_name 
  FROM birds
  JOIN rescues 
  ON birds.rescue_id = rescues.id`);

  res.json(data.rows);
});

app.get('/rescues', async (req, res) => {
  const data = await client.query('SELECT * FROM rescues');

  res.json(data.rows);
});

app.get('/birds/:id', async (req, res) => {
  const birdId = req.params.id;

  const data = await client.query('SELECT birds.id, number_of_eggs, flies, color rescue.name AS rescue_name FROM birds AS bird JOIN rescues AS rescue ON birds.rescue_id=rescue.id WHERE bird.id=$1', [birdId]);

  res.json(data.rows[0]);
});

app.delete('/birds/:id', async (req, res) => {
  const birdId = req.params.id;
  const data = await client.query('DELETE FROM birds WHERE birds.id=$1;', [birdId]);

  res.json(data.rows[0]);
});

app.put('/birds:id', async (req, res) => {
  const birdId = req.params.id;

  try {
    const updatedBird = {
      name: req.body.name,
      number_of_eggs: req.body.number_of_eggs,
      flies: req.body.flies,
      color: req.body.color,
      rescue_id: req.body.rescue_id
    };

    const data = await client.query(`UPDATE birds SET name=$1, number_of_eggs=$2, flies=$3, color=$4, rescue_id=$5 WHERE birds.id=$6
    RETURNING *`, [updatedBird.name, updatedBird.number_of_eggs, updatedBird.flies, updatedBird.color, updatedBird.rescue_id, birdId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/birds', async (req, res) => {
  try {
    const newBird = {
      name: req.body.name,
      number_of_eggs: req.body.number_of_eggs,
      flies: req.body.flies,
      color: req.body.color,
      rescue_id: req.body.rescue_id
    };

    const data = await client.query(`INSERT INTO birds(name, number_of_eggs, flies, color, rescue_id)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *`, [newBird.name, newBird.number_of_eggs, newBird.flies, newBird.color, newBird.rescue_id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
