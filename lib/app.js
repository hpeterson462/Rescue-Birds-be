const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const { values } = require('../data/birds.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/birds', async (req, res) => {
  const data = await client.query('SELECT * from birds');

  res.json(data.rows);
});

app.get('/birds/:id', async (req, res) => {
  const birdId = req.params.id;

  const data = await client.query(`SELECT * from birds where id=${birdId}`);

  res.json(data.rows[0]);
});

app.post('/birds', async (req, res) => {
  const newBird = {
    name: req.body.name,
    number_of_eggs: req.body.number_of_eggs,
    flies: req.body.flies,
    color: req.body.color,
    user_id: req.body.user_id
  };

  const data = await client.query(`
  INSERT INTO birds(name, number_of_eggs, flies, color, user_id)
  VALUES(${ 1}, ${2}, ${3}, ${4})
  RETURNING *`, [newBird.name, newBird.number_of_eggs, newBird.flies, newBird.color, newBird.user_id]);

  res.json(data.rows);
});

app.use(require('./middleware/error'));

module.exports = app;
