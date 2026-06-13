#!/bin/bash
set -e

BACKEND_IMAGE="amitprasad21/inventoryflow-backend:latest"
FRONTEND_IMAGE="amitprasad21/inventoryflow-frontend:latest"

echo "==================================================="
echo "  InventoryFlow AI - Build & Push All Images (Bash)"
echo "==================================================="
echo

echo "1. Logging in to Docker Hub..."
docker login

echo
echo "2. Building Backend Docker Image: $BACKEND_IMAGE..."
cd backend
docker build -t "$BACKEND_IMAGE" .
cd ..

echo
echo "3. Building Frontend Docker Image: $FRONTEND_IMAGE..."
cd frontend
docker build -t "$FRONTEND_IMAGE" .
cd ..

echo
echo "4. Pushing Backend Image to Docker Hub..."
docker push "$BACKEND_IMAGE"

echo
echo "5. Pushing Frontend Image to Docker Hub..."
docker push "$FRONTEND_IMAGE"

echo
echo "==================================================="
echo "  Success! All images pushed:"
echo "  - Backend:  https://hub.docker.com/r/amitprasad21/inventoryflow-backend"
echo "  - Frontend: https://hub.docker.com/r/amitprasad21/inventoryflow-frontend"
echo "==================================================="
echo
