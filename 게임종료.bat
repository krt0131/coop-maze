@echo off
chcp 65001 >nul
title 미로 게임 종료
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\stop.ps1"
echo.
pause
