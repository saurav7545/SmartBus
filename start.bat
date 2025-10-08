@echo off
echo ========================================
echo   Soil Analysis Pro - Starting...
echo ========================================

echo Starting MongoDB service...
net start MongoDB

echo.
echo Starting Python backend server...
start cmd /k "cd backend &&  cd Smartbus && python manage.py runserver"

echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak

echo Starting React frontend development server...
start cmd /k "cd frontend && npm run dev "
start cmd /k "cd .. && cd smartbus-tracker && npm start"

echo.
echo ========================================
echo Application is starting...
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause