@echo off
REM Deploy script for Cloudflare Worker (ffh4x-panel-worker)
REM Run from ffh4x-site directory

echo ==========================================
echo  ffh4x Panel - Cloudflare Worker Deploy
echo ==========================================
echo.

echo [1/5] Verificando Wrangler...
wrangler --version || (echo ERRO: Wrangler nao instalado. Rode: npm install -g wrangler & exit /b 1)

echo.
echo [2/5] Login Cloudflare (se necessario)...
wrangler whoami 2>nul || wrangler login

echo.
echo [3/5] Criando namespaces KV...
echo Criando namespace producao...
for /f "tokens=2 delims=:" %%a in ('wrangler kv namespace create "ASSETS" 2^>^&1 ^| findstr /C:"id ="') do set PROD_ID=%%a
echo PROD_ID=%PROD_ID%

echo Criando namespace preview...
for /f "tokens=2 delims=:" %%a in ('wrangler kv namespace create "ASSETS" --preview 2^>^&1 ^| findstr /C:"id ="') do set PREVIEW_ID=%%a
echo PREVIEW_ID=%PREVIEW_ID%

echo.
echo [4/5] ATENCAO: Atualize wrangler.toml com os IDs acima:
echo   binding = "ASSETS"
echo   id = "%PROD_ID%"
echo   preview_id = "%PREVIEW_ID%"
echo.
pause

echo [5/5] Deploy...
wrangler deploy

echo.
echo ==========================================
echo  Deploy concluido!
echo  URL: https://ffh4x-panel-worker.<SEU_SUBDOMAIN>.workers.dev
echo ==========================================
pause