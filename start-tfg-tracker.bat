@echo off
echo =======================================
echo      TFG Job Tracker Starter
echo =======================================
echo.

echo Checking Node.js and npm installation...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Node.js is not installed or not in PATH! Please install Node.js.
  pause
  exit /b
)

echo MongoDB service is running...

echo.
echo Starting backend server...
start cmd /k "cd backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 >nul

echo.
echo Starting frontend application...
echo (This might take a moment. If the browser doesn't open automatically, go to http://localhost:3000)
cd frontend

echo Checking for node_modules...
if not exist node_modules\ (
  echo node_modules not found. Installing dependencies...
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies! Check the error message above.
    cd ..
    pause
    exit /b
  )
)

echo Starting frontend...
start cmd /k "npm start"
cd ..

echo.
echo TFG Job Tracker is starting!
echo Backend API: http://localhost:5000/api
echo Frontend: http://localhost:3000
echo.
echo If the browser doesn't open automatically, manually navigate to http://localhost:3000
echo.
echo Close this window when you're done using the application.
echo (Don't forget to close the other command windows too)