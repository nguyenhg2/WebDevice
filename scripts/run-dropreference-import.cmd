@echo off
setlocal

cd /d "%~dp0.."

set "DROPREFERENCE_DISCOVERY_PAGES=75"
set "DROPREFERENCE_MAX_GAMES=0"
set "DROPREFERENCE_DELAY_MS=750"

if not exist "node_modules" (
  echo node_modules khong ton tai. Dang chay npm install...
  call npm.cmd install
  if errorlevel 1 exit /b %errorlevel%
)

echo Dang lay du lieu tu DropReference...
echo Log: data\dropreference-import.log

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-dropreference-import.ps1"
exit /b %errorlevel%
