# Automated Verification Test Suite for T&T 3D Studio Architecture (Rebuild Spec 2026-10-22)
$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TEST SUITE: T&T 3D STORE & REAL TRACKING ARCHITECTURE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$html = [System.IO.File]::ReadAllText("$PSScriptRoot/index.html", [System.Text.Encoding]::UTF8)
$appJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/app.js", [System.Text.Encoding]::UTF8)
$productsJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/products-manager.js", [System.Text.Encoding]::UTF8)
$orderJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/order-engine.js", [System.Text.Encoding]::UTF8)
$cartJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/cart.js", [System.Text.Encoding]::UTF8)
$checkoutJs = [System.IO.File]::ReadAllText("$PSScriptRoot/js/checkout.js", [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText("$PSScriptRoot/css/style.css", [System.Text.Encoding]::UTF8)

$tests = @(
    # R1: 5 Discrete User-Centric Views
    @{ Name = 'R1.1: #view-store container exists'; Pass = $html.Contains('id="view-store"') },
    @{ Name = 'R1.2: #view-personalize container exists'; Pass = $html.Contains('id="view-personalize"') },
    @{ Name = 'R1.3: #view-inspiration container exists'; Pass = $html.Contains('id="view-inspiration"') },
    @{ Name = 'R1.4: #view-tracking container exists'; Pass = $html.Contains('id="view-tracking"') },
    @{ Name = 'R1.5: #view-support container exists'; Pass = $html.Contains('id="view-support"') },
    @{ Name = 'R1.6: Desktop tab switcher has 5 primary views'; Pass = ($html.Contains('data-nav-view="view-store"') -and $html.Contains('data-nav-view="view-personalize"') -and $html.Contains('data-nav-view="view-inspiration"') -and $html.Contains('data-nav-view="view-tracking"') -and $html.Contains('data-nav-view="view-support"')) },
    @{ Name = 'R1.7: CSS defines .app-workspace and .hidden'; Pass = ($css.Contains('.app-workspace') -and $css.Contains('.app-workspace.hidden')) },
    @{ Name = 'R1.8: js/app.js implements switchWorkspace function'; Pass = $appJs.Contains('function switchWorkspace(') },
    @{ Name = 'R1.9: js/app.js maps new views and provides fallback for legacy hashes'; Pass = ($appJs.Contains('#store') -and $appJs.Contains('#personalize') -and $appJs.Contains('#inspiration') -and $appJs.Contains('#tracking') -and $appJs.Contains('#support') -and $appJs.Contains('#studio3d')) },
    @{ Name = 'R1.10: js/app.js listens to popstate and hashchange'; Pass = ($appJs.Contains("addEventListener('popstate'") -and $appJs.Contains("addEventListener('hashchange'")) },

    # R2: Responsive Mobile Bottom App Dock
    @{ Name = 'R2.1: Mobile bottom dock element exists with accessible nav'; Pass = ($html.Contains('class="mobile-bottom-dock') -or $html.Contains('mobile-bottom-dock')) },
    @{ Name = 'R2.2: Mobile dock switches to store, inspiration, tracking and support'; Pass = ($html.Contains("window.switchWorkspace('view-store')") -and $html.Contains("window.switchWorkspace('view-inspiration')") -and $html.Contains("window.switchWorkspace('view-tracking')") -and $html.Contains("window.switchWorkspace('view-support')")) },
    @{ Name = 'R2.3: Mobile dock has floating cart trigger'; Pass = ($html.Contains("window.TTCart.openCart()") -and $html.Contains('cart-badge-count')) },
    @{ Name = 'R2.4: Single warm light theme enforced, dark mode toggle removed'; Pass = ($appJs.Contains('applyTheme') -and $appJs.Contains('light-theme') -and -not $html.Contains('theme-toggle-btn active')) },

    # R3: Product Experience & Real Order Tracking (Rebuild Spec F01, F05, F15)
    @{ Name = 'R3.1: Clean product card titles without Model ID or raw English text'; Pass = $productsJs.Contains('getCleanTitle') },
    @{ Name = 'R3.2: Clean photo frame without dark CAD HUD overlays or technical Soi 3D'; Pass = (-not $productsJs.Contains('card-3d-launcher') -and -not $productsJs.Contains('cad-hud-bottom-ruler')) },
    @{ Name = 'R3.3: Per-SKU customization schema hides custom input for standard vanity items'; Pass = ($productsJs.Contains("item.category === 'Ca_Nhan_Hoa_NFC'") -and $productsJs.Contains("customContainer.classList.add('hidden')")) },
    @{ Name = 'R3.4: Real Order Engine exports 6 milestones and secure lookup'; Pass = ($orderJs.Contains('request_received') -and $orderJs.Contains('confirmed') -and $orderJs.Contains('in_production') -and $orderJs.Contains('quality_check') -and $orderJs.Contains('shipped') -and $orderJs.Contains('delivered')) },
    @{ Name = 'R3.5: Order lookup form exists in view-tracking'; Pass = ($html.Contains('id="order-lookup-form"') -and $html.Contains('id="order-lookup-input"')) },
    @{ Name = 'R3.6: Shoppable Inspiration Corner renders setups with product hotspots'; Pass = ($html.Contains('Setup 01') -and $html.Contains('mw-cn-1971424')) },
    @{ Name = 'R3.7: Gift Quiz Modal exists for 1-minute gift finding'; Pass = ($html.Contains('id="gift-quiz-modal"') -and $html.Contains('TTGiftQuiz')) },
    @{ Name = 'R3.8: Curated 6-8 products grid exists for concise homepage'; Pass = ($html.Contains('id="curated-product-grid"') -and $productsJs.Contains('renderCuratedProducts')) },
    @{ Name = 'R3.9: Support & Care Accordions use native details/summary elements'; Pass = ($html.Contains('<details class="support-accordion"') -and $html.Contains('<summary>')) },
    @{ Name = 'R3.10: Checkout inputs have associated for-id labels'; Pass = ($html.Contains('for="checkout-cust-name"') -and $html.Contains('id="checkout-cust-name"') -and $html.Contains('for="checkout-cust-phone"')) }
)

$passed = 0
$failed = 0

foreach ($t in $tests) {
    if ($t.Pass) {
        Write-Host "  [PASS] $($t.Name)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] $($t.Name)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host "Test Results: Total $($tests.Count) | Passed: $passed | Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
