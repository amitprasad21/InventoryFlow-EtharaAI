@echo off
echo ===================================================
echo   InventoryFlow AI - Docker Build and Push
echo ===================================================
echo.

set IMAGE_NAME=amitprasad21/inventoryflow-backend:latest

echo 1. Building Docker Image: %IMAGE_NAME%...
docker build -t %IMAGE_NAME% .
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker build failed. Make sure Docker Desktop is running.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Logging in to Docker Hub...
docker login
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker login failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3. Pushing Image to Docker Hub...
docker push %IMAGE_NAME%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker push failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo   Success! Image pushed to:
echo   https://hub.docker.com/r/amitprasad21/inventoryflow-backend
echo ===================================================
echo.
pause
