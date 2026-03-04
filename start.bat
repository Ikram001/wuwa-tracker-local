@echo off
title WuWa Pull Tracker
color 0A
echo.
echo  ==========================================
echo   WuWa Pull Tracker  -  Local Edition
echo  ==========================================
echo.

:: ── Server deps ─────────────────────────────
if not exist "server\node_modules" (
    echo  [1/2] Installing server dependencies...
    cd server
    call npm install
    if errorlevel 1 ( echo  ERROR: npm install failed for server. & pause & exit /b 1 )
    cd ..
    echo  Server deps installed.
    echo.
)

:: ── Client deps ─────────────────────────────
if not exist "client\node_modules" (
    echo  [2/2] Installing client dependencies...
    cd client
    call npm install
    if errorlevel 1 ( echo  ERROR: npm install failed for client. & pause & exit /b 1 )
    cd ..
    echo  Client deps installed.
    echo.
)

:: ── Start server ─────────────────────────────
echo  Starting API server  (port 4321)...
start "WuWa API Server" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul

:: ── Start client ─────────────────────────────
echo  Starting UI  (port 5173)...
start "WuWa UI" cmd /k "cd client && npm run dev"
timeout /t 4 /nobreak >nul

:: ── Open browser ─────────────────────────────
echo  Opening browser...
start http://localhost:5173

echo.
echo  Both servers are running.
echo  - UI:     http://localhost:5173
echo  - API:    http://localhost:4321
echo  - Data:   server\data\wuwa_pulls.json
echo.
echo  Close the two terminal windows to stop.
echo.
pause