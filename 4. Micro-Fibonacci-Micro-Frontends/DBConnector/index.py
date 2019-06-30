import kafka
import psycopg2
import logging
import json

logger = logging.getLogger("DB Service")

conn = psycopg2.connect('dbname=postgres user=postgres password=postgres_password host=postgres port=5432')
cursor = conn.cursor()
logger.warning("Connected to Postgres. Running initial query...")
cursor.execute("CREATE TABLE IF NOT EXISTS values (number INT PRIMARY KEY, value VARCHAR(65535))")
conn.commit()
logger.warning("Done")

logger.warning("Press enter to connect to Kafka")
consumer = kafka.KafkaConsumer('save_to_db', bootstrap_servers=["kafka:9092"], enable_auto_commit=True)
logger.warning("Starting polling kafka...")

for message in consumer:
    entry = json.loads(message.value)
    key = list(entry.keys())[0]
    value = entry[key]
    prep_query = ""

    if value.strip() == 'Calculating...':
        logger.warning("A new index has been added")
        cursor.execute("INSERT INTO values VALUES (%s, %s)", (key, value))
        conn.commit()

    else:
        logger.warning('Saving fib({})={}'.format(key, value))
        cursor.execute("INSERT INTO values VALUES (%s, %s) ON CONFLICT (number) DO UPDATE SET value=%s;", (key, value, value))
        conn.commit()
    