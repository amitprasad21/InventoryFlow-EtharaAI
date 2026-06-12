@echo off
title InventoryFlow AI Launcher
echo ===================================================
echo   InventoryFlow AI - Launcher
echo ===================================================

echo.
echo 1. Starting FastAPI Backend Server on http://127.0.0.1:8000...
start "InventoryFlow AI - Backend API" cmd /k "cd backend && set DATABASE_URL=sqlite:///./inventoryflow.db && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo.
echo 2. Starting React + Vite Frontend Server on http://localhost:5173...
start "InventoryFlow AI - Frontend Web" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   System launched successfully!
echo   * Backend Swagger Docs: http://127.0.0.1:8000/docs
echo   * Frontend Dashboard: http://localhost:5173
echo ===================================================
echo.
echo Press any key to exit this launcher window (servers will continue running in their own windows).
pause > null
del null
