@echo off
setlocal
cd /d "%~dp0"
docker compose down
echo Containers stopped. Database data is preserved in the Docker volume.
pause
