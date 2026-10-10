param(
  [string]$BuildDir = "dist",
  [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$results = @{ pass = 0; fail = 0; warnings = @() }

function Check-Schema($file, $pattern, $label) {
  $content = Get-Content $file -Raw
  if ($content -match $pattern) {
    if ($Verbose) { Write-Host "  PASS: $label" -ForegroundColor Green }
    $script:results.pass++
  } else {
    Write-Host "  FAIL: $label in $file" -ForegroundColor Red
    $script:results.fail++
    $script:results.warnings += "$label missing in $file"
  }
}

function Get-PageType($path) {
  # Path format: companies\slug\index.html or en\peru\slug\tours\categoria\index.html
  if ($path -match '^index\.html$') { return 'homepage' }
  if ($path -match '^blog\\[^\\]+\\.+\.html$') { return 'blog-post' }
  if ($path -match '^blog\\index\.html$') { return 'blog-index' }
  if ($path -match '^(en|es)\\ai-prompts\\index\.html$') { return 'prompts-index' }
  if ($path -match '^(en|es)\\ai-prompts\\[^\\]+\\index\.html$') { return 'prompt-landing' }
  if ($path -match '^(en|es)\\peru\\[^\\]+\\tours\\[^\\]+\\index\.html$') { return 'categoria' }
  if ($path -match '^(en|es)\\peru\\[^\\]+\\tours\\index\.html$') { return 'tours-listing' }
  if ($path -match '^(en|es)\\peru\\itinerario-\d+-dias\\index\.html$') { return 'itinerario' }
  if ($path -match '^(en|es)\\peru\\preguntas-frecuentes') { return 'faq-hub' }
  if ($path -match '^(en|es)\\peru\\cusco\\tours-machu-picchu\\index\.html$') { return 'tours-machu-picchu' }
  if ($path -match '^(en|es)\\peru\\[^\\]+\\index\.html$') { return 'destino' }
  if ($path -match '^companies\\.+\\index\.html$') { return 'company-en' }
  if ($path -match '^empresas\\.+\\index\.html$') { return 'company-es' }
  if ($path -match '^partner-scout\\') { return 'partner-scout' }
  return 'other'
}

$schemas = @{
  'homepage'       = @('"@type"\s*:\s*"Organization"', '"@type"\s*:\s*"WebSite"', '"@type"\s*:\s*"WebPage"', '"@type"\s*:\s*"BreadcrumbList"', '"@type"\s*:\s*"CollectionPage"')
  'destino'        = @('"@type"\s*:\s*"BreadcrumbList"', 'TouristAttraction|Country|Place', 'FAQPage')
  'tours-listing'  = @('"@type"\s*:\s*"BreadcrumbList"', '"@type"\s*:\s*"ItemList"')
  'categoria'      = @('"@type"\s*:\s*"BreadcrumbList"', '"@type"\s*:\s*"FAQPage"')
  'company-en'     = @('"TravelAgency"', '"aggregateRating"', '"@type"\s*:\s*"FAQPage"')
  'company-es'     = @('"TravelAgency"', '"aggregateRating"', '"@type"\s*:\s*"FAQPage"')
  'prompt-landing' = @('"@type"\s*:\s*"WebPage"', '"@type"\s*:\s*"ItemList"', '"@type"\s*:\s*"FAQPage"')
  'blog-post'      = @('"@type"\s*:\s*"Article"', '"datePublished"')
  'blog-index'     = @('"@type"\s*:\s*"BreadcrumbList"')
  'itinerario'         = @('"@type"\s*:\s*"BreadcrumbList"')
  'faq-hub'            = @('"@type"\s*:\s*"FAQPage"')
  'tours-machu-picchu' = @('"@type"\s*:\s*"ItemList"')
  'partner-scout'  = @('"@type"\s*:\s*"BreadcrumbList"')
}

Write-Host "=== GEO Validation Report ===" -ForegroundColor Cyan
Write-Host "Build directory: $BuildDir`n" -ForegroundColor Cyan

$totalFiles = 0
$checkedFiles = 0
$files = Get-ChildItem $BuildDir -Recurse -Filter "index.html" | Where-Object { $_.FullName -notmatch '\\node_modules\\' }

$seen = @{}
foreach ($file in $files) {
  $relPath = $file.FullName.Substring((Resolve-Path $BuildDir).Path.Length + 1)
  $pageType = Get-PageType $relPath
  $totalFiles++

  if (-not $seen.ContainsKey($pageType)) { $seen[$pageType] = 0 }
  if ($seen[$pageType] -ge 5) { continue }
  $seen[$pageType]++
  $checkedFiles++

  if ($Verbose) {
    Write-Host "`n[$pageType] $relPath" -ForegroundColor Yellow
  }

  if ($schemas.ContainsKey($pageType)) {
    foreach ($pattern in $schemas[$pageType]) {
      Check-Schema $file.FullName $pattern "$pageType -> $pattern"
    }
  }

  Check-Schema $file.FullName '<meta\s+name="description"' "meta-description in $relPath"
  Check-Schema $file.FullName 'rel="canonical"' "canonical-link in $relPath"
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total pages built: $totalFiles" -ForegroundColor White
Write-Host "Pages checked: $checkedFiles" -ForegroundColor White
Write-Host "Passed: $($results.pass)" -ForegroundColor Green
Write-Host "Failed: $($results.fail)" -ForegroundColor Red

if ($results.fail -gt 0) {
  Write-Host "`nFailures:" -ForegroundColor Yellow
  $results.warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}

exit $results.fail
