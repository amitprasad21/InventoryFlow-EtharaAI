#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

IMAGE_NAME="amitprasad21/inventoryflow-backend:latest"

echo "==================================================="
echo "  InventoryFlow AI - Docker Build and Push (Bash)"
echo "==================================================="
echo

echo "1. Building Docker Image: $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

echo
echo "2. Logging in to Docker Hub..."
docker login

echo
echo "3. Pushing Image to Docker Hub..."
docker push "$IMAGE_NAME"

echo
echo "==================================================="
echo "  Success! Image pushed to:"
echo "  https://hub.docker.com/r/amitprasad21/inventoryflow-backend"
echo "==================================================="
echo
