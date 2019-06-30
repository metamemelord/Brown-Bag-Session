const express = require("express");
const path = require('path')
const bodyParser = require("body-parser")


const app = express();
app.use(bodyParser.json());
const controllers = require("./controllers");
const pgClient = controllers.pgClient;

pgClient.query("CREATE TABLE IF NOT EXISTS values (number INT)");
  console.log("Created the table");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
}); 

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"));
});

app.get("/Arch-monolith.png", (req, res) => {
  res.sendFile(path.join(__dirname, "Arch-monolith.png"));
}); 

app.get("/api/poll-all", controllers.pollAll); // For polling all indices
app.get("/api/poll-calc", controllers.pollCalculated); // For polling all calculated values
app.post("/api/idx", controllers.newIndex); // For posting a new index

app.listen(3000, () => {
  console.log("Listening..")
})

