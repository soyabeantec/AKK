#!/bin/bash
cd producer
docker build . --tag=producer
cd ..
docker run -d \
    --name producer \
    -v $PWD/logs:/logs \
    -v $PWD/data:/data \
    -e KH="$(ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+')" \
    producer
