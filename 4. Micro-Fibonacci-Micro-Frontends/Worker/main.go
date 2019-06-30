package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"os"
	"os/signal"
	"strconv"

	"github.com/Shopify/sarama"
)

var done = []*big.Int{big.NewInt(0), big.NewInt(1)}

func fib(n int) *big.Int {
	if n < len(done) {
		return done[n]
	}
	for idx := len(done); idx < n; idx++ {
		calc := big.NewInt(0)
		calc.Add(calc, done[idx-1])
		calc.Add(calc, done[idx-2])
		done = append(done, calc)
	}
	return done[n-1]
}

func calculateAndAssignFib(n int) {
	result := fib(n)
	log.Printf("Calculated fib(%d)=%s\n", n, result.String())
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 10
	config.Producer.Return.Successes = true

	producer, err := sarama.NewAsyncProducer([]string{"kafka:9092"}, config)
	if err != nil {
		panic(err)
	}

	defer func() {
		if err := producer.Close(); err != nil {
			log.Fatalln(err)
		}
	}()

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt)
	m := make(map[int]string)
	m[n] = result.String()
	message, err := json.Marshal(m)
	if err != nil {
		panic(err)
	}
	producer.Input() <- &sarama.ProducerMessage{Topic: "save_to_db", Key: nil, Value: sarama.StringEncoder(message)}
}

// Test topic, will be deleted
func testTopic() {
	master, err := sarama.NewConsumer([]string{"kafka:9092"}, nil)
	if err != nil {
		panic(err)
	}

	consumer, err := master.ConsumePartition("test_topic", 0, sarama.OffsetOldest)

	if err != nil {
		panic(err)
	}

	defer consumer.Close()

	log.Println("Connected to temporary topic, polling now..")

	for {
		select {
		case err := <-consumer.Errors():
			fmt.Printf("Kafka error: %s\n", err)
		case msg := <-consumer.Messages():
			log.Println(string(msg.Value))
		}
	}
}

func main() {
	go testTopic()

	master, err := sarama.NewConsumer([]string{"kafka:9092"}, nil)
	if err != nil {
		panic(err)
	}

	consumer, err := master.ConsumePartition("new_idx", 0, sarama.OffsetNewest)

	if err != nil {
		panic(err)
	}

	defer consumer.Close()

	log.Println("Connected to kafka, polling for messages...")

	for {
		select {
		case err := <-consumer.Errors():
			fmt.Printf("Kafka error: %s\n", err)
		case msg := <-consumer.Messages():
			index, err := strconv.Atoi(string(msg.Value))
			if err != nil {
				continue
			}
			go calculateAndAssignFib(index)
		}
	}
}
