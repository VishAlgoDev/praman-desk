import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from '../src/handlers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const PORT = Number(process.env.PORT || 3402);

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (urlObj.pathname.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  let filePath = path.join(publicDir, urlObj.pathname === '/' ? 'index.html' : urlObj.pathname);
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(publicDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === '.html'
      ? 'text/html; charset=utf-8'
      : ext === '.css'
      ? 'text/css; charset=utf-8'
      : ext === '.js'
      ? 'application/javascript; charset=utf-8'
      : ext === '.json'
      ? 'application/json; charset=utf-8'
      : 'text/plain; charset=utf-8';

  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.end(fs.readFileSync(filePath));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Praman Audit Desk listening at http://127.0.0.1:${PORT}`);
});
