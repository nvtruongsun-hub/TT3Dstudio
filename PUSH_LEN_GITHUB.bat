@echo off
chcp 65001 >nul
title T&T 3D Studio - Tải File Lên GitHub
cls
echo ===================================================================
echo             T&T 3D STUDIO - TỰ ĐỘNG ĐẨY MÃ NGUỒN LÊN GITHUB
echo      Kho lưu trữ: https://github.com/nvtruongsun-hub/TT3Dstudio
echo ===================================================================
echo.

set "GIT_DIR=C:\Users\truongg\AppData\Local\github-copilot-git-2.53.0-4\mingw64\bin"
set "PATH=%GIT_DIR%;%PATH%"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy Git trong đường dẫn cấu hình!
    pause
    exit /b
)

echo [*] Đang kiểm tra thay đổi mã nguồn...
git add -A
git commit -m "Cap nhat toan bo ma nguon, giao dien va logic T&T 3D Studio" >nul 2>nul

echo.
echo ===================================================================
echo  CHỌN HÌNH THỨC XÁC THỰC GITHUB:
echo ===================================================================
echo  [1] Xác thực tự động qua Trình duyệt (Khuyên dùng - 1 click Authorize)
echo  [2] Nhập GitHub Personal Access Token (PAT)
echo.
set /p mode="Chọn (1 hoặc 2, mặc định là 1): "

if "%mode%"=="2" (
    echo.
    set /p token="Dán Personal Access Token của bạn vào đây: "
    if not defined token (
        echo Token không hợp lệ!
        pause
        exit /b
    )
    echo.
    echo [*] Đang kết nối và đẩy mã nguồn bằng Token...
    git remote set-url origin https://%token%@github.com/nvtruongsun-hub/TT3Dstudio.git
    git push -u origin main
    git remote set-url origin https://github.com/nvtruongsun-hub/TT3Dstudio.git
    goto ketthuc
)

echo.
echo [*] Đang kết nối tới GitHub...
echo [LƯU Ý] Nếu trình duyệt mở ra cửa sổ đăng nhập GitHub, bạn chỉ cần bấm nút:
echo         "Authorize Git Credential Manager" hoặc "Sign in with browser"
echo.

git push -u origin main

:ketthuc
if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo   [THÀNH CÔNG] ĐÃ ĐẨY ĐẦY ĐỦ CÁC THƯ MỤC LÊN GITHUB!
    echo.
    echo   Kiểm tra kho lưu trữ tại:
    echo   -> https://github.com/nvtruongsun-hub/TT3Dstudio
    echo.
    echo   Website trực tuyến (GitHub Pages):
    echo   -> https://nvtruongsun-hub.github.io/TT3Dstudio/
    echo ===================================================================
) else (
    echo.
    echo ===================================================================
    echo   [CHÚ Ý] Quá trình tải lên chưa hoàn tất do chưa cấp quyền GitHub.
    echo   Vui lòng thử lại và xác nhận trên cửa sổ trình duyệt hiện ra.
    echo ===================================================================
)

echo.
pause
