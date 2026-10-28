@echo off
setlocal
cd /d "%~dp0"
if not exist .env (
  copy .env.example .env >nul
  echo Created .env from .env.example. For local development, review the values first.
)
echo Starting Caduceus services. The first build can take several minutes.
docker compose up --build
pause
