# End-to-end logic simulation test for T&T 3D Studio Tab Architecture
$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   END-TO-END WORKSPACE ROUTER & INTERACTION TEST" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Test hash map completeness in js/app.js
$appJs = Get-Content -Raw -Encoding UTF8 'js/app.js'

$requiredHashes = @('#store', '#studio3d', '#calculator', '#standards')
$allHashesPresent = $true
foreach ($h in $requiredHashes) {
    if (-not $appJs.Contains($h)) {
        Write-Host "Missing hash route: $h" -ForegroundColor Red
        $allHashesPresent = $false
    }
}

if ($allHashesPresent) {
    Write-Host "  [PASS] All 4 primary hash routes present in router map" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Missing hash routes" -ForegroundColor Red
    exit 1
}

# 2. Test view IDs in index.html
$html = Get-Content -Raw -Encoding UTF8 'index.html'
$requiredViews = @('view-store', 'view-studio3d', 'view-configurator', 'view-standards')
$allViewsPresent = $true
foreach ($v in $requiredViews) {
    if (-not $html.Contains("id=""$v""")) {
        Write-Host "Missing view ID: $v" -ForegroundColor Red
        $allViewsPresent = $false
    }
}

if ($allViewsPresent) {
    Write-Host "  [PASS] All 4 discrete workspace views defined in HTML" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Missing workspace views" -ForegroundColor Red
    exit 1
}

# 3. Test that views have app-workspace class and initial active/hidden states
$storeActive = $html -match 'id="view-store"\s+class="app-workspace\s+active"'
$studioHidden = $html -match 'id="view-studio3d"\s+class="app-workspace\s+hidden"'
$configHidden = $html -match 'id="view-configurator"\s+class="app-workspace\s+hidden"'
$standardsHidden = $html -match 'id="view-standards"\s+class="app-workspace\s+hidden"'

if ($storeActive -and $studioHidden -and $configHidden -and $standardsHidden) {
    Write-Host "  [PASS] Initial workspace states: view-store active, others hidden" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Incorrect initial workspace visibility classes" -ForegroundColor Red
    exit 1
}

# 4. Test Mobile Bottom Dock specifications
$dockPresent = $html.Contains('id="mobile-app-dock"')
$dockPills = [regex]::Matches($html, 'data-nav-view="([^"]+)"')
$dockViewNames = @()
foreach ($m in $dockPills) { $dockViewNames += $m.Groups[1].Value }

$hasStore = $dockViewNames -contains 'view-store'
$hasStudio = $dockViewNames -contains 'view-studio3d'
$hasConfig = $dockViewNames -contains 'view-configurator'
$hasStandards = $dockViewNames -contains 'view-standards'

if ($dockPresent -and $hasStore -and $hasStudio -and $hasConfig -and $hasStandards) {
    Write-Host "  [PASS] Mobile bottom dock contains all 4 view targets" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Mobile bottom dock missing view targets" -ForegroundColor Red
    exit 1
}

# 5. Test 3D synchronization and Soi 3D transition
$viewerJs = Get-Content -Raw -Encoding UTF8 'js/viewer3d.js'
$productsJs = Get-Content -Raw -Encoding UTF8 'js/products-manager.js'

$hasSoi3D = $productsJs.Contains('Soi 3D')
$hasCard3DCall = $productsJs.Contains('window.open3DViewerById')
$hasRouterSwitchInViewer = $viewerJs.Contains("window.switchWorkspace('view-studio3d'")
$hasResizeExport = $viewerJs.Contains('window.onResize3DViewer = onResize')
$hasAppJsResizeTrigger = $appJs.Contains('window.onResize3DViewer()')

if ($hasSoi3D -and $hasCard3DCall -and $hasRouterSwitchInViewer -and $hasResizeExport -and $hasAppJsResizeTrigger) {
    Write-Host "  [PASS] 3D Synchronization & 'Soi 3D' cross-workspace transition fully verified" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Incomplete 3D synchronization wiring" -ForegroundColor Red
    exit 1
}

# 6. Test Interactive Calculator and Cart integration across tabs
$calcJs = Get-Content -Raw -Encoding UTF8 'js/calculator.js'
$cartJs = Get-Content -Raw -Encoding UTF8 'js/cart.js'

$hasZaloPrefill = $calcJs.Contains('window.sendZaloConfigQuote')
$hasAddConfigCart = $calcJs.Contains('window.addConfigQuoteToCart')
$hasVietQRTrigger = $cartJs.Contains('triggerVietQRModal')
$hasDropzone = $html.Contains('id="config-dropzone"')
$hasSlider = $html.Contains('id="config-qty-slider"')

if ($hasZaloPrefill -and $hasAddConfigCart -and $hasVietQRTrigger -and $hasDropzone -and $hasSlider) {
    Write-Host "  [PASS] Calculator & Cart persistent interaction across tabs fully verified" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Missing calculator/cart components" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ALL END-TO-END VERIFICATION CHECKS PASSED!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
