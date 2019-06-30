import redis
import sys

sys.setrecursionlimit(25005)

r = redis.Redis(host="redis", port=6379)

sub = r.pubsub()


def fib(n):
    if r.hget("values", n) and r.hget("values", n) != b'Still calculating...':
        return int(r.hget("values", n))
    if n < 2:
        r.hset("values", n, n)
        return n
    value = fib(n-1) + fib(n-2)
    r.hset("values", n, value)
    return value

def main():
    print("Subscribing to insert channel...")
    sub.subscribe("insert")
    print("Done!")

    print("Starting pooling...")
    for message in sub.listen():
        if message:
            print("Recieved values", message)
            r.hset('values', message["data"], fib(int(message["data"])))

main()
