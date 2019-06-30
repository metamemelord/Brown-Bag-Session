FROM python:3.7-slim
RUN pip3 install psycopg2-binary kafka-python
WORKDIR /app
COPY . .
CMD ["python", "index.py"]  