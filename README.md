docker run -p 6379:6379 --name some-redis -d redis

docker run -it --link some-redis:redis --rm redis redis-cli -h redis -p 6379