FROM alpine:latest

RUN apk add --no-cache postgresql-client dcron

WORKDIR /app

COPY backup.sh .
COPY crontab .

RUN chmod +x backup.sh && \
    crontab crontab

CMD ["crond", "-f", "-L", "/var/log/cron.log"]
