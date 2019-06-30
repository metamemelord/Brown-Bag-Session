import kafka
from postgres import Postgres
import logging
import json

logger = logging.getLogger(__file__)

db = Postgres("postgres://postgres:postgres_password@postgres/postgres")
logger.warning("Connected to Postgres. Running initial query...")
db.run("CREATE TABLE IF NOT EXISTS values (number INT PRIMARY KEY, value VARCHAR(65535))")
logger.warning("Done")

consumer = kafka.KafkaConsumer('save_to_db', bootstrap_servers=["kafka:9092"], enable_auto_commit=True)

logger.warning("Starting polling kafka...")

for message in consumer:
    entry = json.loads(message.value)
    logger.error(entry)
    key = list(entry.keys())[0]
    value = entry[key]
    query = ""
    if value.strip() == 'Calculating...':
        query = 'INSERT into values ({}, {});'.format(key, value)
    else:
        logger.warning('Saving fib({})={}'.format(key, value))
        query = 'UPDATE values set value={} where number={};'.format(value, key)
    db.run(query)
    logger.warning(db.run("SELECT * from values;"))
