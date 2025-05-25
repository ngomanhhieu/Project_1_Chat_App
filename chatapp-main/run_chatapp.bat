@echo off
cd /d D:\chatapp
echo  Running Docker Compose...
docker-compose up -d --build

if errorlevel 1 (
    echo  Docker error
    pause
    exit /b
)

echo ⏳Waiting for Docker to run containers
timeout /t 15
echo 🌐 Opening chat app
start https://localhost:8443

echo OK
pause
