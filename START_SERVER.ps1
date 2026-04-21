#!/usr/bin/env powershell
# Student Portal - Local Server Startup Script
# Run this to start the FastAPI server on port 8000

Write-Host "
╔════════════════════════════════════════╗
║  STUDENT MANAGEMENT PORTAL             ║
║  FastAPI Local Server - Port 8000      ║
╚════════════════════════════════════════╝
" -ForegroundColor Cyan

# Get this script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "📍 Project Path: $scriptDir" -ForegroundColor Gray
Write-Host ""

# Check dependencies
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import fastapi, uvicorn, sqlalchemy, pydantic, openpyxl" 2>$null
    Write-Host "✅ All dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Missing dependencies!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run this command to install:" -ForegroundColor Yellow
    Write-Host "  pip install fastapi uvicorn sqlalchemy pydantic openpyxl python-multipart httpx" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🚀 STARTING SERVER..." -ForegroundColor Yellow
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  🌐 Server: http://127.0.0.1:8000    ║" -ForegroundColor Green
Write-Host "║  ✅ Status: RUNNING                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   👤 Admin:   admin@college.edu / admin123" -ForegroundColor White
Write-Host "   👤 Student: student1@college.edu / password123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Open browser to http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host "⚠️  Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

Write-Host ""
Write-Host "🛑 Server stopped" -ForegroundColor Yellow
