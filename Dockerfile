FROM redis
COPY redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-service", "/usr/local/etc/redis/redis.conf" ]