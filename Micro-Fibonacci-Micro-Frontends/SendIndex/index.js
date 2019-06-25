const express = require("express")
const Kafka = require("node-rdkafka")
const path = require("path")

const app = express()
app.use(require("body-parser").json())

const producer = getProducer();
function getProducer() {
    if (!producer) {
        var producer = new Kafka.Producer({
            'metadata.broker.list': 'kafka:9092',
            'dr_cb': true
          });
          
        producer.on('ready', function(arg) {
            console.log('producer ready.' + JSON.stringify(arg));
        });
        
        producer.on('disconnected', function(arg) {
            console.log('producer disconnected. ' + JSON.stringify(arg));
        });
        producer.connect()
    } 
    return producer;
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.post("/api/idx", (req, res) => {
    const index = req.body.idx;
    if(!index) {
        return res.status(400).send({})
    }
    const buf = Buffer.from(index.toString(), 'utf8');
    producer.produce('new_idx', -1, buf, null, new Date().getTime(), "");
})

app.listen(3000, (err) => {
    if(err) {
        console.log(err)
    } else {
        console.log("Server started")
    }
})