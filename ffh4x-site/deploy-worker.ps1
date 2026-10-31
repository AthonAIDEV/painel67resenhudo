# Deploy script for Cloudflare Worker (ffh4x-panel-worker)
# Run from ffh4x-site directory: .\deploy-worker.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ffh4x Panel - Cloudflare Worker Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Wrangler
Write-Host "[1/5] Verificando Wrangler..." -ForegroundColor Yellow
try {
    $version = wrangler --version 2>$null
    Write-Host "  OK: $version" -ForegroundColor Green
} catch {
    Write-Host "  ERRO: Wrangler nao instalado." -ForegroundColor Red
    Write-Host "  Rode: npm install -g wrangler" -ForegroundColor Red
    exit 1
}

# 2. Login
Write-Host "[2/5] Verificando login Cloudflare..." -ForegroundColor Yellow
$whoami = wrangler whoami 2>$null
if (-not $whoami) {
    Write-Host "  Fazendo login..." -ForegroundColor Yellow
    wrangler login
} else {
    Write-Host "  OK: Logado como $whoami" -ForegroundColor Green
}

# 3. Create KV namespaces
Write-Host "[3/5] Criando/verificando namespaces KV..." -ForegroundColor Yellow

$prodNs = wrangler kv namespace list 2>$null | ConvertFrom-Json | Where-Object { $_.title -eq "ASSETS" }
if (-not $prodNs) {
    Write-Host "  Criando namespace ASSETS (producao)..." -ForegroundColor Yellow
    $result = wrangler kv namespace create "ASSETS" 2>&1
    $prodId = ($result | Select-String 'id = "(.+?)"').Matches.Groups[1].Value
    Write-Host "  ID Producao: $prodId" -ForegroundColor Green
} else {
    $prodId = $prodNs.id
    Write-Host "  OK: Namespace ASSETS existe (ID: $prodId)" -ForegroundColor Green
}

$previewNs = wrangler kv namespace list --preview 2>$null | ConvertFrom-Json | Where-Object { $_.title -eq "ASSETS" }
if (-not $previewNs) {
    Write-Host "  Criando namespace ASSETS (preview)..." -ForegroundColor Yellow
    $result = wrangler kv namespace create "ASSETS" --preview 2>&1
    $previewId = ($result | Select-String 'id = "(.+?)"').Matches.Groups[1].Value
    Write-Host "  ID Preview: $previewId" -ForegroundColor Green
} else {
    $previewId = $previewNs.id
    Write-Host "  OK: Namespace ASSETS preview existe (ID: $previewId)" -ForegroundColor Green
}

# 4. Update wrangler.toml
Write-Host "[4/5] Atualizando wrangler.toml com IDs..." -ForegroundColor Yellow
$tomlPath = "wrangler.toml"
$toml = Get-Content $tomlPath -Raw
$toml = $toml -replace 'id = ".+?"', "id = \"$prodId\""
$toml = $toml -replace 'preview_id = ".+?"', "preview_id = \"$previewId\""
Set-Content $tomlPath -Value $toml -Encoding UTF8
Write-Host "  OK: wrangler.toml atualizado" -ForegroundColor Green

# 5. Deploy
Write-Host "[5/5] Fazendo deploy..." -ForegroundColor Yellow
wrangler deploy

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Deploy concluido!" -ForegroundColor Green
Write-Host "  URL: https://ffh4x-panel-worker.<SEU_SUBDOMAIN>.workers.dev" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan