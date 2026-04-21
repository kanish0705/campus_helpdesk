@echo off
title Student Portal - Local Server
echo.
echo ========================================
echo   STUDENT MANAGEMENT PORTAL
echo   FastAPI Local Server on Port 8000
echo ========================================
echo.
echo Starting server...
echo.

cd /d "%~dp0"

python -c "import fastapi, uvicorn, sqlalchemy, pydantic, openpyxl" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Required packages not installed!
    echo.
    echo Run this in PowerShell to install:
    echo   pip install fastapi uvicorn sqlalchemy pydantic openpyxl python-multipart httpx
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ All dependencies found
echo.
echo 🚀 STARTING SERVER...
echo.
echo ================================
echo   Server: http://127.0.0.1:8000
echo   Status: RUNNING
echo ================================
echo.
echo Demo Credentials:
echo   Admin:   admin@college.edu / admin123
echo   Student: student1@college.edu / password123
echo.
echo Press CTRL+C to stop the server
echo.

python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

pause
