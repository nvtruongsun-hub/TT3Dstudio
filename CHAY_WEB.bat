@echo off
chcp 65001 >nul
title T&T 3D Studio - Khởi Chạy Website
cls
echo ===================================================================
echo               T&T 3D STUDIO - KHỞI CHẠY HỆ THỐNG
echo ===================================================================
echo.
echo  [1] Mở trực tiếp trên Trình duyệt mặc định (Chrome / Edge)
echo  [2] Khởi chạy Local Web Server (http://localhost:8080)
echo  [3] Mở trang Quản trị Xưởng (Admin Dashboard)
echo.
set /p opt="Vui lòng chọn (1, 2 hoặc 3, mặc định là 1): "

if "%opt%"=="2" (
    echo.
    echo Đang khởi động máy chủ Web nội bộ...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
    goto end
)

if "%opt%"=="3" (
    echo.
    echo Đang mở trang Quản trị Admin Dashboard...
    start "" "%~dp0admin.html"
    goto end
)

echo.
echo Đang mở trang chủ T&T 3D Studio...
start "" "%~dp0index.html"

:end
timeout /t 3 >nul
