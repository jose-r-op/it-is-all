// Servidor estático mínimo para verificar el build (SPA fallback). Uso: node scripts/serve-dist.cjs [puerto]
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'dist', 'tienda-ropa', 'browser');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const port = Number(process.argv[2] || 4300);
http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.normalize(path.join(root, urlPath));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`http://localhost:${port}`));

