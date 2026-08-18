@echo off
setlocal
echo.
echo ==========================================
echo  ClarityLoop Project 4 - First Time Setup
echo ==========================================
echo.

echo Installing backend dependencies...
pushd "%~dp0backend"
call npm install
if errorlevel 1 (
  echo Backend npm install failed.
  popd
  pause
  exit /b 1
)
if not exist ".env" copy ".env.example" ".env" >nul
popd

echo.
echo Installing frontend dependencies...
pushd "%~dp0frontend"
call npm install
if errorlevel 1 (
  echo Frontend npm install failed.
  popd
  pause
  exit /b 1
)
if not exist ".env" copy ".env.example" ".env" >nul
popd

echo.
echo Setup complete.
echo Next: make sure SQL Server and ClarityLoopDB are available, then run start-dev.bat.
echo.
pause
