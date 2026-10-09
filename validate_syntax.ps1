# Syntax and balance validator for JS and CSS files
$ErrorActionPreference = 'Stop'

function Test-FileBrackets($filePath) {
    $content = Get-Content -Raw -Encoding UTF8 $filePath
    $curly = 0
    $round = 0
    $square = 0
    $inString = $false
    $stringChar = ''
    $inComment = $false
    $inLineComment = $false

    $chars = $content.ToCharArray()
    for ($i = 0; $i -lt $chars.Length; $i++) {
        $c = $chars[$i]
        $next = if ($i + 1 -lt $chars.Length) { $chars[$i + 1] } else { '' }

        if ($inLineComment) {
            if ($c -eq "`n") { $inLineComment = $false }
            continue
        }
        if ($inComment) {
            if ($c -eq '*' -and $next -eq '/') { $inComment = $false; $i++ }
            continue
        }
        if ($inString) {
            if ($c -eq '\') { $i++; continue }
            if ($c -eq $stringChar) { $inString = $false }
            continue
        }

        if ($c -eq '/' -and $next -eq '/') { $inLineComment = $true; $i++; continue }
        if ($c -eq '/' -and $next -eq '*') { $inComment = $true; $i++; continue }
        if ($c -eq '"' -or $c -eq "'" -or $c -eq '`') { $inString = $true; $stringChar = $c; continue }

        if ($c -eq '{') { $curly++ }
        elseif ($c -eq '}') { $curly-- }
        elseif ($c -eq '(') { $round++ }
        elseif ($c -eq ')') { $round-- }
        elseif ($c -eq '[') { $square++ }
        elseif ($c -eq ']') { $square-- }

        if ($curly -lt 0 -or $round -lt 0 -or $square -lt 0) {
            Write-Host "Premature closing bracket in $filePath at pos $i (curly=$curly, round=$round, square=$square)" -ForegroundColor Red
            return $false
        }
    }

    if ($curly -ne 0 -or $round -ne 0 -or $square -ne 0) {
        Write-Host "Unbalanced brackets in $($filePath): curly=$curly, round=$round, square=$square" -ForegroundColor Red
        return $false
    }
    Write-Host "  [OK] $filePath brackets balanced (curly=0, round=0, square=0)" -ForegroundColor Green
    return $true
}

Write-Host "Validating JS and CSS files..."
$files = @('js/app.js', 'js/viewer3d.js', 'js/products-manager.js', 'js/calculator.js', 'js/cart.js', 'css/style.css')
$allOk = $true
foreach ($f in $files) {
    if (-not (Test-FileBrackets $f)) { $allOk = $false }
}

if (-not $allOk) { exit 1 } else { Write-Host "All files syntactically balanced!" -ForegroundColor Green; exit 0 }
