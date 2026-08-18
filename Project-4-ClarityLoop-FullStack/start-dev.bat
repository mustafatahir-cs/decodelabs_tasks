@echo off
setlocal

echo Starting ClarityLoop backend...
start "ClarityLoop API" cmd /k "cd /d ""%~dp0backend"" && npm start"

timeout /t 2 /nobreak >nul

echo Starting ClarityLoop frontend...
start "ClarityLoop Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Two terminals were opened.
echo Backend:  http://localhost:5000
echo Frontend: usually http://localhost:5173
echo.
