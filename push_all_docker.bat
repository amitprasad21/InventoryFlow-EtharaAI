@echo off
echo ===================================================
echo   InventoryFlow AI - Build & Push All Docker Images
echo ===================================================
echo.

set BACKEND_IMAGE=amitprasad21/inventoryflow-backend:latest
set FRONTEND_IMAGE=amitprasad21/inventoryflow-frontend:latest

echo 1. Logging in to Docker Hub...
docker login
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker login failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Building Backend Docker Image: %BACKEND_IMAGE%...
cd backend
docker build -t %BACKEND_IMAGE% .
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Backend Docker build failed.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo 3. Building Frontend Docker Image: %FRONTEND_IMAGE%...
cd frontend
docker build -t %FRONTEND_IMAGE% .
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Frontend Docker build failed.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo 4. Pushing Backend Image to Docker Hub...
docker push %BACKEND_IMAGE%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Backend Docker push failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 5. Pushing Frontend Image to Docker Hub...
docker push %FRONTEND_IMAGE%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Frontend Docker push failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo   Success! All images pushed:
echo   - Backend:  https://hub.docker.com/r/amitprasad21/inventoryflow-backend
echo   - Frontend: https://hub.docker.com/r/amitprasad21/inventoryflow-frontend
echo ===================================================
echo.
pause
