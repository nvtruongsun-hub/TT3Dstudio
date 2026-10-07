@echo off
setlocal
chcp 65001 >nul
title TT 3D Studio - Khoi Chay Website
cls
echo ===================================================================
echo               TT 3D STUDIO - KHOI CHAY HE THONG
echo ===================================================================
echo.
echo  [1] Mo truc tiep tren Trinh duyet mac dinh (Chrome / Edge)
echo  [2] Khoi chay Local Web Server (http://localhost:8080)
echo  [3] Mo trang Quan tri Xuong (Admin Dashboard)
echo.
set /p opt="Vui long chon (1, 2 hoac 3, mac dinh la 1): "

if "%opt%"=="2" (
    echo.
    echo Dang khoi dong may chu Web noi bo...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
    goto end
)

if "%opt%"=="3" (
    echo.
    echo Dang mo trang Quan tri Admin Dashboard...
    start "" "%~dp0admin.html"
    goto end
)

echo.
echo Dang mo trang chu TT 3D Studio...
start "" "%~dp0index.html"

:end
timeout /t 3 >nul
