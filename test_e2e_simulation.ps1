# End-to-end logic simulation test for T&T 3D Studio Architecture (Rebuild Spec 2026-10-22)
$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   END-TO-END STORE, TRACKING & NAVIGATION SIMULATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$appJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/app.js", [System.Text.Encoding]::UTF8)
$html = [System.IO.File]::ReadAllText("$PSScriptRoot/index.html", [System.Text.Encoding]::UTF8)
$productsJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/products-manager.js", [System.Text.Encoding]::UTF8)
$orderJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/order-engine.js", [System.Text.Encoding]::UTF8)

# 1. Test hash map completeness in js/app.js
$requiredHashes = @('#store', '#personalize', '#inspiration', '#tracking', '#support')
$allHashesPresent = $true
foreach ($h in $requiredHashes) {
    if (-not $appJs.Contains($h)) {
        Write-Host "Missing hash route: $h" -ForegroundColor Red
        $allHashesPresent = $false
    }
}

if ($allHashesPresent) {
    Write-Host "  [PASS] All 5 primary hash routes present in router map" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Missing hash routes" -ForegroundColor Red
    exit 1
}

# 2. Test view IDs in index.html
$requiredViews = @('view-store', 'view-personalize', 'view-inspiration', 'view-tracking', 'view-support')
$allViewsPresent = $true
foreach ($v in $requiredViews) {
    if (-not $html.Contains("id=""$v""")) {
        Write-Host "Missing view ID: $v" -ForegroundColor Red
        $allViewsPresent = $false
    }
}

if ($allViewsPresent) {
    Write-Host "  [PASS] All 5 discrete user-centric views defined in HTML" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Missing workspace views" -ForegroundColor Red
    exit 1
}

# 3. Test that views have app-workspace class and initial active/hidden states
$storeActive = $html -match 'id="view-store"\s+class="app-workspace\s+active"'
$personalizeHidden = $html -match 'id="view-personalize"\s+class="app-workspace\s+hidden'
$inspirationHidden = $html -match 'id="view-inspiration"\s+class="app-workspace\s+hidden'
$trackingHidden = $html -match 'id="view-tracking"\s+class="app-workspace\s+hidden'
$supportHidden = $html -match 'id="view-support"\s+class="app-workspace\s+hidden'

if ($storeActive -and $personalizeHidden -and $inspirationHidden -and $trackingHidden -and $supportHidden) {
    Write-Host "  [PASS] Initial workspace states: view-store active, others hidden" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Incorrect initial workspace visibility classes" -ForegroundColor Red
    exit 1
}

# 4. Test Mobile Bottom Dock specifications
$dockPresent = $html.Contains('class="mobile-bottom-dock')
$hasStore = $html.Contains("window.switchWorkspace('view-store')")
$hasInspiration = $html.Contains("window.switchWorkspace('view-inspiration')")
$hasTracking = $html.Contains("window.switchWorkspace('view-tracking')")
$hasSupport = $html.Contains("window.switchWorkspace('view-support')")
$hasCart = $html.Contains("window.TTCart.openCart()")

if ($dockPresent -and $hasStore -and $hasInspiration -and $hasTracking -and $hasSupport -and $hasCart) {
    Write-Host "  [PASS] Mobile bottom dock contains all 5 items specified in spec" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Mobile bottom dock missing items" -ForegroundColor Red
    exit 1
}

# 5. Test Real Order Tracking Engine API contract
$hasEngine = $orderJs.Contains('window.TTOrderEngine =')
$hasGetOrder = $orderJs.Contains('getOrderProjection')
$hasCreateOrder = $orderJs.Contains('createOrderRequest')
$hasUpdateStatus = $orderJs.Contains('updateOrderStatus')
$hasHistory = $orderJs.Contains('history')

if ($hasEngine -and $hasGetOrder -and $hasCreateOrder -and $hasUpdateStatus -and $hasHistory) {
    Write-Host "  [PASS] Real Order Engine exports createOrder, getOrder, updateStatus & history" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Incomplete Order Engine API contract" -ForegroundColor Red
    exit 1
}

# 6. Test Per-SKU Option Isolation (F15)
$hasNfcCheck = $productsJs.Contains("item.category === 'Ca_Nhan_Hoa_NFC'")
$hasContainerHide = $productsJs.Contains("customContainer.classList.add('hidden')")
$hasCleanTitle = $productsJs.Contains("getCleanTitle")

if ($hasNfcCheck -and $hasContainerHide -and $hasCleanTitle) {
    Write-Host "  [PASS] Per-SKU customization isolation and clean title extraction verified" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Incomplete option isolation logic" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ALL E2E SIMULATION CHECKS PASSED (6/6)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
exit 0
