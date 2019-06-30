const results = [0, 1];

const fib = idx => {
  if (results.length > idx) return results[idx];
  results[idx] = fib(idx - 1) + fib(idx - 2);
  return results[idx];
};

module.exports = redisClient => {
  const redisSubscriber = redisClient.duplicate();
  redisSubscriber.subscribe("insert");
  redisSubscriber.on("message", function(channel, message) {
    redisClient.HSET("values", message, fib(parseInt(message)));
  });
};
