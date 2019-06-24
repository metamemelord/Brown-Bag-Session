package main

import (
	"fmt"
	"log"
	"math/big"
	"strconv"

	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
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

func makeDummyCall() {
	p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": "kafka:9092"})
	if err != nil {
		log.Println("3 *************")
		panic(err)
	}
	defer p.Close()

	k := strconv.Itoa(12)
	topic := "new_idx"
	p.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic},
		Value:          []byte(k),
	}, nil)
}

func calculateAndAssignFib(n int) {
	calculationChannel := make(chan *big.Int)
	go func(value int) {
		calculationChannel <- fib(value)
	}(n)
	result := <-calculationChannel
	log.Println("*******************************")
	log.Println(result)
	log.Println("*******************************")
	p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": "kafka:9092"})
	if err != nil {
		log.Println("2 *************")
		panic(err)
	}
	defer p.Close()
	topic := "index_ready"
	p.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic},
		Value:          []byte(result.String()),
	}, nil)
}

func main() {
	makeDummyCall()
	c, err := kafka.NewConsumer(&kafka.ConfigMap{"bootstrap.servers": "kafka:9092"})

	if err != nil {
		log.Println("1 *************")
		panic(err)
	}

	c.Subscribe("new_idx", nil)

	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			value, errValue := strconv.Atoi(string(msg.Value))
			if errValue != nil {
				panic(errValue)
			}
			go calculateAndAssignFib(value)
		} else {
			fmt.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}

	c.Close()

}
