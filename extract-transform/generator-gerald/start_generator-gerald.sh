#!/usr/bin/env bash
cd generator-gerald
docker build . --tag="generator-gerald"
cd ..
docker run -d \
  --name generator-gerald \
  --volume $PWD/data:/data \
  generator-gerald
