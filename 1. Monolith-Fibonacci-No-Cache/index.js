process.env.UV_THREADPOOL_SIZE = 4;
const express = require("express");
const path = require("path");

const { Pool } = require("pg");
const pgClient = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});
pgClient.on("error", err => {
  console.error(err);
});

pgClient.query(
  "CREATE TABLE IF NOT EXISTS values (number INT, calculated VARCHAR(65535))"
);
console.log("Created the table");

const pollAll = async (req, res) => {
  try {
    const values = await pgClient.query("SELECT * from values");
    res.send(
      values.rows.map(element => {
        return { number: element.number };
      })
    );
  } catch (err) {
    res.status(500).send({ status: "Failed" });
  }
};

const pollCalculated = async (req, res) => {
  try {
    const values = await pgClient.query("SELECT * from values");
    const result = {};
    for (const value of values.rows) {
      result[value.number] = value.calculated;
    }
    res.send(result);
  } catch (err) {
    res.status(500).send({ status: "Failed" });
  }
};

const newIndex = async (req, res) => {
  try {
    const idx = req.body.idx;
    await pgClient.query(
      "INSERT INTO values(number, calculated) VALUES($1, $2)",
      [idx, "Calculating..."]
    );
    res.send({ status: "Waiting" });
    fibonacciWrapper(idx);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).send({ status: "Failed" });
    }
    console.log(err);
  }
};

const app = express();
app.use(require("body-parser").json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/Arch-monolith.jpg", (req, res) => {
  res.sendFile(path.join(__dirname, "Arch-monolith.jpg"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"));
});

app.get("/api/poll-all", pollAll); // For polling all indices
app.get("/api/poll-calc", pollCalculated); // For polling all calculated values
app.post("/api/idx", newIndex); // For posting a new index

app.listen(3000, err => {
  console.log("Listening..");
});

const fibonacciWrapper = N => {
  Promise.resolve(fibonacci(N).toString()).then(async value => {
    await pgClient.query("UPDATE values SET calculated=$1 where number=$2", [
      value,
      N
    ]);
  });
  return true;
};

const fibonacci = N => {
  if (N < 2) return N;
  return fibonacci(N - 1) + fibonacci(N - 2);
};