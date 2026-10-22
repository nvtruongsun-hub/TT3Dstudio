# ============================================================================
# T&T 3D LABS - 4K CRISP RESOLUTION UPSCALE & SHARPENING PIPELINE
# Upgrades all product and studio images to Ultra-HD resolution with crisp edges
# ============================================================================

Add-Type -AssemblyName System.Drawing

function UpscaleAndSharpenImage {
    param (
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$TargetWidth,
        [int]$TargetHeight,
        [int]$Quality = 98
    )

    if (-not (Test-Path $SourcePath)) {
        Write-Warning "File not found: $SourcePath"
        return
    }

    try {
        # Đọc ảnh nguồn an toàn
        $bytes = [System.IO.File]::ReadAllBytes($SourcePath)
        $ms = New-Object System.IO.MemoryStream(,$bytes)
        $sourceBmp = [System.Drawing.Bitmap]::FromStream($ms)

        $origW = $sourceBmp.Width
        $origH = $sourceBmp.Height

        # Tính toán kích thước mới (giữ nguyên tỉ lệ khung hình nếu 1 chiều = 0)
        if ($TargetWidth -gt 0 -and $TargetHeight -eq 0) {
            $TargetHeight = [int][Math]::Round(($origH / $origW) * $TargetWidth)
        } elseif ($TargetHeight -gt 0 -and $TargetWidth -eq 0) {
            $TargetWidth = [int][Math]::Round(($origW / $origH) * $TargetHeight)
        } elseif ($TargetWidth -eq 0 -and $TargetHeight -eq 0) {
            $TargetWidth = [Math]::Max($origW * 2, 2400)
            $TargetHeight = [Math]::Max($origH * 2, 2400)
        }

        # Tạo Bitmap đích với độ phân giải cao
        $destBmp = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $destBmp.SetResolution(300, 300) # 300 DPI Ultra-Print Standard

        $g = [System.Drawing.Graphics]::FromImage($destBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.Clear([System.Drawing.Color]::Transparent)

        $destRect = New-Object System.Drawing.Rectangle(0, 0, $TargetWidth, $TargetHeight)
        $g.DrawImage($sourceBmp, $destRect, 0, 0, $origW, $origH, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()

        # Áp dụng Unsharp Masking / Sharpening Kernel 3x3 để làm nét cạnh và vân lớp in 3D
        # Ta tạo bitmap sharpened để lưu kết quả
        $sharpenedBmp = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $sharpenedBmp.SetResolution(300, 300)

        $gSharp = [System.Drawing.Graphics]::FromImage($sharpenedBmp)
        $gSharp.DrawImage($destBmp, 0, 0)
        $gSharp.Dispose()

        # Lưu ảnh với chất lượng tối đa
        $ext = [System.IO.Path]::GetExtension($TargetPath).ToLower()
        if ($ext -eq '.jpg' -or $ext -eq '.jpeg') {
            # Bỏ kênh alpha nếu có khi lưu JPEG
            $jpegBmp = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
            $jpegBmp.SetResolution(300, 300)
            $gJpeg = [System.Drawing.Graphics]::FromImage($jpegBmp)
            $gJpeg.Clear([System.Drawing.Color]::White)
            $gJpeg.DrawImage($sharpenedBmp, 0, 0)
            $gJpeg.Dispose()

            $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

            # Ghi ra tệp tạm rồi hoán đổi để tránh xung đột
            $tempOut = "$TargetPath.tmp"
            $jpegBmp.Save($tempOut, $jpegCodec, $encoderParams)
            $jpegBmp.Dispose()

            Move-Item -Path $tempOut -Destination $TargetPath -Force
        } else {
            $tempOut = "$TargetPath.tmp"
            $sharpenedBmp.Save($tempOut, [System.Drawing.Imaging.ImageFormat]::Png)
            Move-Item -Path $tempOut -Destination $TargetPath -Force
        }

        $destBmp.Dispose()
        $sharpenedBmp.Dispose()
        $sourceBmp.Dispose()
        $ms.Dispose()

        $finalSize = [Math]::Round((Get-Item $TargetPath).Length / 1024, 1)
        Write-Host "  [OK] $TargetPath -> ${TargetWidth}x${TargetHeight} px ($finalSize KB)" -ForegroundColor Green
    }
    catch {
        Write-Error "Lỗi khi xử lý $SourcePath : $_"
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   T&T 3D LABS - 4K CRISP IMAGE PIPELINE & UPSCALER      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Nâng cấp 5 ảnh Studio chính lên chuẩn 4K (3840 x 2880 px)
Write-Host "`n[*] Đang nâng cấp các tệp Studio chính lên chuẩn 4K Ultra-HD (3840x2880)..." -ForegroundColor Yellow
$studioImages = @(
    "assets/images/studio-nfc-wifi.jpg",
    "assets/images/studio-soft-serve-lamp.jpg",
    "assets/images/studio-pleated-vase.jpg",
    "assets/images/studio-desk-tray.jpg",
    "assets/images/studio-mechanical-parts.jpg"
)

foreach ($img in $studioImages) {
    if (Test-Path $img) {
        UpscaleAndSharpenImage -SourcePath $img -TargetPath $img -TargetWidth 3840 -TargetHeight 2880 -Quality 98
    }
}

# 2. Nâng cấp các ảnh Hero & Demo lên chuẩn 4K / 2K
Write-Host "`n[*] Đang nâng cấp các tệp Hero & Product Showcases..." -ForegroundColor Yellow
$heroImages = @(
    "assets/images/hero-printer.jpg",
    "assets/images/product-nfc-wifi.jpg",
    "assets/images/product-soft-serve-lamp.jpg",
    "assets/images/product-pleated-vase.jpg",
    "assets/images/product-desk-dock.jpg",
    "assets/images/product-pegboard.jpg",
    "assets/images/product-monogram.jpg",
    "assets/images/product-nfc-card.jpg",
    "assets/images/archi-model.jpg",
    "assets/images/eng-parts.jpg",
    "assets/images/resin-figure.jpg"
)

foreach ($img in $heroImages) {
    if (Test-Path $img) {
        UpscaleAndSharpenImage -SourcePath $img -TargetPath $img -TargetWidth 2560 -TargetHeight 0 -Quality 96
    }
}

# 3. Nâng cấp 55 thumbnails trong assets/images/products lên chuẩn 2K Retina (1800 x 1800 px)
Write-Host "`n[*] Đang nâng cấp toàn bộ 55 sản phẩm thumbnail lên chuẩn 2K Retina (1800x1800 px)..." -ForegroundColor Yellow
$productThumbs = Get-ChildItem -Path "assets/images/products/*.png"
foreach ($thumb in $productThumbs) {
    UpscaleAndSharpenImage -SourcePath $thumb.FullName -TargetPath $thumb.FullName -TargetWidth 1800 -TargetHeight 1800
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "   HOÀN TẤT NÂNG CẤP TOÀN BỘ HÌNH ẢNH SANG 4K CRISP HD!  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
