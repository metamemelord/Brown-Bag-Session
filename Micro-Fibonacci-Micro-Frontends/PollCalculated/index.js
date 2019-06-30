const express = require("express")
const path = require("path")
const {Pool} = require("pg")

const db = new Pool({
    host: "postgres",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "postgres_password"
})

const app = express()
app.use(require("body-parser").json())

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "script.js"))
})

app.get("/api/poll-calc", async (req, res) => {
    const values = await db.query('SELECT * from values order by number');
    res.send(values.rows);
})

app.listen(3000, (err) => {
    if(err) {
        console.log(err)
    } else {
        console.log("Server started")
    }
})