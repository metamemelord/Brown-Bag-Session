FROM golang:alpine as builder
RUN apk add git build-base
RUN go get github.com/Shopify/sarama
WORKDIR /app
COPY main.go .
RUN go build main.go

FROM alpine
WORKDIR /app
COPY --from=builder /app/main .
CMD ["./main"]