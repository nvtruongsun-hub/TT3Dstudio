# Automated Verification Test Suite for T&T 3D Studio Tab Architecture
$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TEST SUITE: MULTI-VIEW WORKSPACE TAB ARCHITECTURE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$html = Get-Content -Raw -Encoding UTF8 'index.html'
$appJs = Get-Content -Raw -Encoding UTF8 'js/app.js'
$viewerJs = Get-Content -Raw -Encoding UTF8 'js/viewer3d.js'
$productsJs = Get-Content -Raw -Encoding UTF8 'js/products-manager.js'
$calcJs = Get-Content -Raw -Encoding UTF8 'js/calculator.js'
$cartJs = Get-Content -Raw -Encoding UTF8 'js/cart.js'
$css = Get-Content -Raw -Encoding UTF8 'css/style.css'

$tests = @(
    # R1: Multi-view workspace architecture
    @{ Name = 'R1.1: #view-store container exists'; Pass = $html.Contains('id="view-store"') },
    @{ Name = 'R1.2: #view-studio3d container exists'; Pass = $html.Contains('id="view-studio3d"') },
    @{ Name = 'R1.3: #view-configurator container exists'; Pass = $html.Contains('id="view-configurator"') },
    @{ Name = 'R1.4: #view-standards container exists'; Pass = $html.Contains('id="view-standards"') },
    @{ Name = 'R1.5: Desktop tab switcher has 4 discrete views'; Pass = ($html -match 'data-nav-view="view-store"' -and $html -match 'data-nav-view="view-studio3d"' -and $html -match 'data-nav-view="view-configurator"' -and $html -match 'data-nav-view="view-standards"') },
    @{ Name = 'R1.6: CSS defines .app-workspace and .hidden'; Pass = ($css.Contains('.app-workspace') -and $css.Contains('.app-workspace.hidden')) },
    @{ Name = 'R1.7: CSS defines workspace-fade-in transition'; Pass = $css.Contains('workspaceCrossFade') },
    @{ Name = 'R1.8: js/app.js implements switchWorkspace function'; Pass = $appJs.Contains('function switchWorkspace(') },
    @{ Name = 'R1.9: js/app.js maps #store, #studio3d, #calculator, #standards'; Pass = ($appJs.Contains('#store') -and $appJs.Contains('#studio3d') -and $appJs.Contains('#calculator') -and $appJs.Contains('#standards')) },
    @{ Name = 'R1.10: js/app.js listens to popstate and hashchange'; Pass = ($appJs.Contains("addEventListener('popstate'") -and $appJs.Contains("addEventListener('hashchange'")) },

    # R2: Responsive Mobile Bottom App Dock
    @{ Name = 'R2.1: #mobile-app-dock element exists'; Pass = $html.Contains('id="mobile-app-dock"') },
    @{ Name = 'R2.2: Mobile dock has 4 tab buttons with data-nav-view'; Pass = ($html -match '(?s)id="mobile-app-dock".*data-nav-view="view-store".*data-nav-view="view-studio3d".*data-nav-view="view-configurator".*data-nav-view="view-standards"') },
    @{ Name = 'R2.3: Mobile dock has floating cart trigger'; Pass = $html.Contains('mobile-dock-cart-btn') },
    @{ Name = 'R2.4: CSS defines mobile-app-dock with media query'; Pass = ($css.Contains('.mobile-app-dock') -and $css.Contains('@media (max-width: 767px)')) },
    @{ Name = 'R2.5: Mobile dock padding-bottom set on workspace'; Pass = $css.Contains('padding-bottom: 96px;') },

    # R3: Preserved Interactive State & 3D Synchronization
    @{ Name = 'R3.1: #viewer-canvas exists in #view-studio3d'; Pass = $html.Contains('id="viewer-canvas"') },
    @{ Name = 'R3.2: js/viewer3d.js exports window.onResize3DViewer'; Pass = $viewerJs.Contains('window.onResize3DViewer = onResize') },
    @{ Name = 'R3.3: js/app.js triggers onResize3DViewer upon activating view-studio3d'; Pass = $appJs.Contains('window.onResize3DViewer()') },
    @{ Name = 'R3.4: Product cards have Soi 3D button calling open3DViewerById'; Pass = ($productsJs.Contains('window.open3DViewerById') -and $productsJs.Contains('Soi 3D')) },
    @{ Name = 'R3.5: open3DViewerById switches workspace to view-studio3d'; Pass = $viewerJs.Contains("switchWorkspace('view-studio3d'") },
    @{ Name = 'R3.6: 3D Action bar exists in DOM with active model info'; Pass = ($html.Contains('id="viewer-action-bar"') -and $html.Contains('id="viewer-active-model-title"')) },
    @{ Name = 'R3.7: 3D Action bar supports adding model to cart'; Pass = $viewerJs.Contains('window.addActive3DModelToCart') },
    @{ Name = 'R3.8: Calculator state & dropzone IDs intact in view-configurator'; Pass = ($html.Contains('id="config-dropzone"') -and $html.Contains('id="config-file-input"') -and $html.Contains('id="config-qty-slider"')) },
    @{ Name = 'R3.9: Calculator Zalo prefill and cart buttons functional'; Pass = ($calcJs.Contains('window.sendZaloConfigQuote') -and $calcJs.Contains('window.addConfigQuoteToCart')) },
    @{ Name = 'R3.10: Slide-over cart and VietQR modal present and accessible'; Pass = ($html.Contains('id="cart-slide-drawer"') -and $html.Contains('id="vietqr-modal"') -and $html.Contains('id="order-modal"')) },
    @{ Name = 'R3.11: Theme switcher works across tabs'; Pass = ($appJs.Contains('initThemeSwitcher') -and $html.Contains('theme-toggle-btn')) }
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
