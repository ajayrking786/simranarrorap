@echo off
setlocal
cd /d "%~dp0"
if not exist .env (
  copy .env.example .env >nul
  echo Created .env from .env.example.
  echo IMPORTANT: Open .env and change SESSION_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD before production use.
)
if not exist node_modules (
  echo Installing packages...
  call npm install
  if errorlevel 1 goto :error
)
echo Starting website...
call npm start
goto :eof
:error
echo.
echo Setup failed. Make sure Node.js 20+ and npm are installed.
pause
