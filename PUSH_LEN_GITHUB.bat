@echo off
setlocal
chcp 65001 >nul
title Day Ma Nguon Len GitHub - TT 3D Studio
cls

echo ===================================================================
echo               TT 3D STUDIO - TAI DU LIEU LEN GITHUB
echo           Repo: https://github.com/nvtruongsun-hub/TT3Dstudio
echo ===================================================================
echo.

set "GIT_PATH=C:\Users\truongg\AppData\Local\github-copilot-git-2.53.0-4\mingw64\bin"
set "PATH=%GIT_PATH%;%PATH%"

echo [*] Kiem tra Git...
git status
echo.

echo [*] Dang chuan bi day toan bo thu muc (assets, css, js)...
git add -A
git commit -m "Cap nhat day du toan bo anh, style va logic cho TT 3D Studio" >nul 2>nul

echo [*] Dang day ma nguon len GitHub (origin main)...
echo     Neu trinh duyet bat len, ban hay bam nut "Authorize" / "Dang nhap"
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo   [THANH CONG] DA TAI TOAN BO DU LIEU LEN GITHUB!
    echo   Trang web truc tuyen tai:
    echo   https://nvtruongsun-hub.github.io/TT3Dstudio/
    echo ===================================================================
) else (
    echo.
    echo [!] Chua the day len tu dong. Ban co the su dung Personal Access Token
    echo     hoac keo tha thu muc assets, css, js len trang web GitHub.
)

echo.
pause
