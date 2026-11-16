@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 처음 실행이면 Node.js / 인터넷 터널 프로그램을 자동으로 준비
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\setup.ps1"
if errorlevel 1 (
  pause
  exit /b 1
)
rem 방금 Node.js를 설치했으면 이 창에는 아직 경로가 없어서 추가
set "PATH=%PATH%;%ProgramFiles%\nodejs"
start "" http://localhost:3000
node server.js
pause
