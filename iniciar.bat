@echo off
title XFlow - Inicializacao
cd /d %~dp0

echo ========================================
echo         XFlow ERP - Inicializacao
echo ========================================
echo.
echo Iniciando servidores...

REM Inicia o Backend (porta 3001)
start "XFlow Backend" cmd /c "cd /d %~dp0backend && npm start & echo Backend rodando em http://localhost:3001 & echo Pressione Ctrl+C para parar & pause"

REM Aguarda 3 segundos pro backend iniciar
timeout /t 3 /nobreak >nul

REM Inicia o ERP Frontend (porta 5173)
start "XFlow ERP" cmd /c "cd /d %~dp0erp && echo Iniciando ERP em http://localhost:5173 & npx vite --host & pause"

echo.
echo ========================================
echo   Servidores iniciados com sucesso!
echo ========================================
echo.
echo   Backend:  http://localhost:3001
echo   ERP:      http://localhost:5173
echo.
echo   Para parar, feche as janelas ou use parar.bat
echo.
pause
