FROM golang:alpine as builder
RUN apk add build-base git
RUN go get github.com/Shopify/sarama
WORKDIR /app
COPY main.go .
RUN go build main.go

FROM alpine
WORKDIR /app
COPY --from=builder /app/main .
CMD ["./main"]