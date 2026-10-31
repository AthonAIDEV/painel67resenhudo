export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let path = url.pathname;
    
    // Normalize path
    if (path === '/' || !path.includes('.') || path.endsWith('/')) {
      path = '/index.html';
    }
    
    // Try to get asset from KV
    const asset = await env.ASSETS.get(path);
    
    if (!asset) {
      // SPA fallback - serve index.html for client-side routes
      const fallback = await env.ASSETS.get('/index.html');
      if (!fallback) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(fallback.body, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // Determine content type
    const headers = new Headers();
    const ext = path.split('.').pop()?.toLowerCase();
    
    const contentTypes = {
      'js': 'application/javascript; charset=utf-8',
      'css': 'text/css; charset=utf-8',
      'html': 'text/html; charset=utf-8',
      'json': 'application/json; charset=utf-8',
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'ico': 'image/x-icon',
      'webmanifest': 'application/manifest+json',
      'txt': 'text/plain; charset=utf-8',
      'xml': 'application/xml; charset=utf-8',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'eot': 'application/vnd.ms-fontobject'
    };
    
    if (ext && contentTypes[ext]) {
      headers.set('Content-Type', contentTypes[ext]);
    }
    
    // Cache headers
    if (path.startsWith('/assets/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path === '/manifest.json') {
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    } else {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    
    // Security headers
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
    
    return new Response(asset.body, { headers });
  }
};