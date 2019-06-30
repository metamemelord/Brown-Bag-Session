const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const events = require("events")
const cors = require('cors');

const app = express();
const emitter = new events.EventEmitter()
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  const indexes = await pgClient.query('SELECT * from values');
  if (!indexes.rowCount) {
    return res.send({})
  }
  const populatedFields = {};
  let len = 0;

  emitter.once("all_done", (finalValues) => {
    res.send(finalValues)
  });

  for(const numbers of indexes.rows) {
    redisClient.hget("values", numbers.number, (err, value) => {
      populatedFields[numbers.number.toString()] = value;
      len++;
      if(len == indexes.rows.length) {
        emitter.emit("all_done", populatedFields)
      }
    });
  }
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 25000) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Still calculating...');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .then(() => {
    app.listen(5000, err => {
      console.log('Listening');
    });
  })
  .catch(err => console.log(err));
