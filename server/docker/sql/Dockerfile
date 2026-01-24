FROM ubuntu:latest
RUN apt-get update && apt-get install -y sqlite3
WORKDIR /app
COPY query.sql /app
CMD ["sqlite3","test.db",".read query.sql"]
