import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from '../src/handlers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const PORT = Number(process.env.PORT || 3402);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function resolveStaticPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return path.join(publicDir, 'index.html');
  if (clean === '/desks') return path.join(publicDir, 'desks', 'index.html');
  if (clean === '/verify' || clean.startsWith('/case/')) return path.join(publicDir, 'verify', 'index.html');
  if (clean === '/docs' || clean.startsWith('/docs/')) return path.join(publicDir, 'docs', 'index.html');
  if (clean === '/roadmap') return path.join(publicDir, 'roadmap', 'index.html');

  const candidate = path.resolve(publicDir, '.' + pathname);
  if (!candidate.startsWith(publicDir)) return path.join(publicDir, 'index.html');

  if (fs.existsSync(candidate)) {
    if (fs.statSync(candidate).isDirectory()) {
      const dirIndex = path.join(candidate, 'index.html');
      if (fs.existsSync(dirIndex)) return dirIndex;
    } else {
      return candidate;
    }
  }
  return path.join(publicDir, 'index.html');
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (urlObj.pathname.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  const filePath = resolveStaticPath(urlObj.pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.end(fs.readFileSync(filePath));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Praman Audit Desk listening at http://127.0.0.1:${PORT}`);
});
