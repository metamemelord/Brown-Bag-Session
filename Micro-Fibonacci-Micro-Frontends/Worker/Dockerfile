FROM golang:alpine as builder
RUN apk add git build-base librdkafka-dev pkgconf
RUN go get gopkg.in/confluentinc/confluent-kafka-go.v1/kafka
WORKDIR /app
COPY main.go .
RUN go build main.go

FROM alpine
RUN apk add build-base librdkafka-dev pkgconf
WORKDIR /app
COPY --from=builder /app/main .
CMD ["./main"]