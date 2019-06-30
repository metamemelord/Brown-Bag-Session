const redis = require("redis");

const fibonacciWorker = require("./fibonacci_worker");

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

setTimeout(() => {
  fibonacciWorker(redisClient);
}, 10);

const { Pool } = require("pg");
const pgClient = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});
pgClient.on("error", () => console.log("Lost PG connection"));

exports.pollAll = async (req, res) => {
  try {
    const values = await pgClient.query("SELECT * from values");
    res.send(values.rows);
  } catch (err) {
    res.status(500).send({ status: "Failed" });
  }
};

exports.pollCalculated = async (req, res) => {
  try {
    redisClient.HGETALL("values", (err, data) => {
      res.send(data);
    });
  } catch (err) {
    res.status(500).send({ status: "Failed" });
  }
};

exports.newIndex = async (req, res) => {
  try {
    const idx = req.body.idx;
    redisPublisher.publish("insert", idx);
    redisClient.HSET("values", idx, "Calculating...");
    await pgClient.query("INSERT INTO values(number) VALUES($1)", [idx]);
    res.send({ status: "Queued" });
  } catch (err) {
    res.status(500).send({ status: "Failed" });
  }
};

exports.pgClient = pgClient;