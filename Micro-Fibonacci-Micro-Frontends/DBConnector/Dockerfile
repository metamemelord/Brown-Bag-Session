FROM python:3.7-slim
RUN pip3 install postgres kafka-python
WORKDIR /app
COPY . .
CMD ["python", "index.py"]  