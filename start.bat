@echo off
echo ========================================
echo   SmartBus Application - Starting...
echo ========================================

echo Starting Python backend server...
start cmd /k "cd backend && cd Smartbus && python manage.py runserver"

echo.
echo Waiting for backend to initialize...
timeout /t 3 /nobreak

echo Starting React frontend development server...
start cmd /k "cd frontend && npm run dev"

echo.
echo Starting SmartBus Tracker (Live Map)...
start cmd /k "cd smartbus-tracker && npm start"

echo.
echo ========================================
echo   SmartBus Application Started!
echo ========================================
echo.
echo Main App:    http://localhost:5173
echo Backend:     http://localhost:8000
echo Live Tracker: http://localhost:3001
echo API Health:  http://localhost:8000/api/health/
echo.
echo Press any key to exit...
pause
