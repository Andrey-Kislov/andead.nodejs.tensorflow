#!/bin/bash
set -ev

# Build the Docker images
docker build -t andead/nodejs.tensorflow:latest .

# Login to Docker Hub and upload images
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
docker push andead/nodejs.tensorflow:latest