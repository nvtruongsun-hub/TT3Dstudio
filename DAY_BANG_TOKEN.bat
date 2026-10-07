@echo off
setlocal
chcp 65001 >nul
title Day code bang GitHub Token
cls
echo ===================================================================
echo     DAY MA NGUON LEN GITHUB BANG PERSONAL ACCESS TOKEN (PAT)
echo ===================================================================
echo.
echo Ban co the lay token trong 30 giay tai:
echo https://github.com/settings/tokens
echo (Chon Generate new token classic - tick chon "repo" - Copy token)
echo.
set /p token="Dan ma Token cua ban vao day roi nhan Enter: "
if not defined token (
    echo Token trong!
    pause
    exit /b
)

set "GIT_PATH=C:\Users\truongg\AppData\Local\github-copilot-git-2.53.0-4\mingw64\bin"
set "PATH=%GIT_PATH%;%PATH%"

echo.
echo [*] Dang tai toan bo thu muc len GitHub...
git add -A
git commit -m "Cap nhat toan bo ma nguon len GitHub" >nul 2>nul
git remote set-url origin https://%token%@github.com/nvtruongsun-hub/TT3Dstudio.git
git push -u origin main
git remote set-url origin https://github.com/nvtruongsun-hub/TT3Dstudio.git

if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo   [THANH CONG] DA DAY TOAN BO DU LIEU LEN GITHUB!
    echo   Kiem tra tai: https://github.com/nvtruongsun-hub/TT3Dstudio
    echo   Website: https://nvtruongsun-hub.github.io/TT3Dstudio/
    echo ===================================================================
) else (
    echo.
    echo [Loi] Token khong chinh xac hoac khong co quyen ghi vao repo.
)

echo.
pause
