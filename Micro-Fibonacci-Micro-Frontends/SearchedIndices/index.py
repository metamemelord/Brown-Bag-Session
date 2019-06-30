import kafka
import psycopg2
import logging
import json

logger = logging.getLogger("DB Service")

conn = psycopg2.connect('dbname=postgres user=postgres password=postgres_password host=postgres port=5432')
cursor = conn.cursor()
logger.warning("Connected to Postgres. Running initial query...")
cursor.execute("CREATE TABLE IF NOT EXISTS indices (number INT)")
conn.commit()
logger.warning("Done")

logger.warning("Press enter to connect to Kafka")
consumer = kafka.KafkaConsumer('new_idx', bootstrap_servers=["kafka:9092"], enable_auto_commit=False)
logger.warning("Starting polling kafka...")

for message in consumer:
    logger.warning("Saving new index in DB...")
    idx = message.value.decode("ascii").strip()
    cursor.execute("INSERT INTO indices VALUES (%s)", (idx,))
    conn.commit()