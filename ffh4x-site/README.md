# ffh4x Panel - Site Oficial

Site de download do **Painel ffh4x by mu** - Aimbot & ESP para Free Fire.

## 🚀 Deploy na Cloudflare Pages

### Método 1: Dashboard (Mais Fácil)

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Pages** → **Create a project** → **Connect to Git**
3. Conecte seu repositório (GitHub/GitLab)
4. Configurações de build:
   - **Project name**: `ffh4x-panel`
   - **Production branch**: `main`
   - **Build command**: (deixe vazio)
   - **Build output directory**: `public`
   - **Root directory**: `/` (ou `ffh4x-site` se o repo tiver só isso)
5. Clique em **Save and Deploy**

### Método 2: Wrangler CLI (Linha de Comando)

```bash
# Instalar Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy direto da pasta public
wrangler pages deploy public --project-name=ffh4x-panel

# Ou deploy com wrangler.toml
cd ffh4x-site
wrangler pages deploy public --project-name=ffh4x-panel
```

### Método 3: GitHub Actions (CI/CD)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ffh4x-panel
          directory: ffh4x-site/public
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

Configure os secrets no GitHub:
- `CLOUDFLARE_API_TOKEN` - Token da API Cloudflare (Pages:Edit)
- `CLOUDFLARE_ACCOUNT_ID` - Account ID da Cloudflare

## 📁 Estrutura do Projeto

```
ffh4x-site/
├── public/                 # Pasta servida (deploy target)
│   ├── index.html         # Página principal
│   ├── manifest.json      # PWA manifest
│   ├── _headers           # Headers HTTP (cache, security)
│   ├── _redirects         # Redirects SPA + legacy URLs
│   └── assets/
│       ├── style.css      # Estilos completos
│       ├── app.js         # JavaScript modular
│       └── favicon.svg    # Ícone SVG
├── wrangler.toml          # Config Cloudflare Pages
└── README.md
```

## ✨ Funcionalidades do Site

- **Mobile-first** - Otimizado para celular (seu uso principal)
- **PWA Ready** - Instalável como app, funciona offline
- **SPA Routing** - Navegação suave via `_redirects`
- **Performance** - Cache agressivo via `_headers`, lazy loading
- **Acessibilidade** - ARIA labels, focus visible, semântico
- **Dark/Light** - Respeita `prefers-color-scheme`
- **Animações** - IntersectionObserver, contadores, parallax
- **Toast System** - Feedback visual para downloads/erros
- **Phone Preview Interativo** - Abas funcionais (Aimbot/ESP/Config)

## 🔧 Personalização

### Alterar Links de Download

Edite `public/assets/app.js` - seção `CONFIG.downloads`:

```javascript
const CONFIG = {
    downloads: {
        stable: {
            name: 'ffh4x-panel-v2.4.1.apk',
            url: 'https://SEU_BUCKET/ffh4x-panel-v2.4.1.apk',
            size: '42 MB',
            version: 'v2.4.1'
        },
        // ...
    }
};
```

### Atualizar Versão

1. Altere `CONFIG.downloads.stable.version` em `app.js`
2. Atualize `#versionBadge` no `index.html`
3. Adicione entrada no changelog

### Cores/Tema

Edite variáveis CSS em `public/assets/style.css`:

```css
:root {
    --accent: #00ff88;      /* Verde principal */
    --bg: #0a0f0d;          /* Background dark */
    --fg: #e8f5ed;          /* Texto principal */
    /* ... */
}
```

## 📱 Testar Localmente

```bash
# Python 3
cd ffh4x-site/public
python -m http.server 8080

# Node.js (serve)
npx serve public

# PHP
cd ffh4x-site/public
php -S localhost:8080
```

Acesse `http://localhost:8080`

## 🌐 Domínio Personalizado

1. No Dashboard Cloudflare Pages → **Custom domains**
2. Adicione `ffh4x.dev` e `www.ffh4x.dev`
3. Configure DNS na Cloudflare:
   - `CNAME` `ffh4x-panel.pages.dev` (proxy on)
   - `CNAME` `www` → `ffh4x-panel.pages.dev` (proxy on)
4. SSL/TLS → **Full (strict)**
5. Edge Certificates → **Always Use HTTPS** ON

## 📊 Analytics (Opcional)

Adicione no `<head>` do `index.html`:

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "SEU_TOKEN"}'></script>

<!-- Ou Google Analytics -->
<!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script> -->
```

## ⚡ Otimizações Incluídas

- **Headers de Cache**: Assets imutáveis = 1 ano, HTML = revalidate
- **Security Headers**: CSP-ready, X-Frame-Options, etc.
- **Compressão**: Brotli/Gzip automático na Cloudflare
- **HTTP/3**: Habilitado por padrão na Cloudflare
- **Edge Cache**: Global CDN em 300+ localidades
- **Early Hints**: 103 Early Hints para preload crítico

## 📝 Checklist Pré-Deploy

- [ ] APK hospedado (GitHub Releases, R2, S3, etc.)
- [ ] URLs de download atualizadas no `app.js`
- [ ] Hash SHA-256 do APK verificado
- [ ] Favicon PNGs gerados (72-512px) em `assets/`
- [ ] Screenshots PWA adicionadas em `assets/`
- [ ] Domínio configurado (se usar custom)
- [ ] Analytics configurado (opcional)
- [ ] Testado mobile (Chrome DevTools device toolbar)

## 🔗 Links Úteis

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Core Web Vitals](https://web.dev/vitals/)

## 📄 Licença

Este projeto é apenas para fins educacionais. O painel ffh4x é propriedade de **mu**.

---

**Deploy feliz!** 🎮✨

*Painel ffh4x by mu - Aimbot & ESP para Free Fire*