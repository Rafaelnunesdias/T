@echo off
title XFlow - Parar Servidores
cd /d %~dp0

echo ========================================
echo     Parando servidores XFlow...
echo ========================================
echo.

REM Fecha as janelas do backend e ERP
taskkill /FI "WindowTitle eq XFlow Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq XFlow ERP*" /F >nul 2>&1

REM Garante que node.exe seja encerrado
taskkill /F /IM node.exe >nul 2>&1

echo   Todos os servidores foram parados.
echo.
pause
