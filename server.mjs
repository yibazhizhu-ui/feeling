import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 4173;
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json' };
const server = http.createServer(async (req,res) => {
  try {
    const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = requested === '/' ? 'index.html' : requested.slice(1);
    const file = path.resolve(root,relative);
    const allowed = file === path.join(root,'index.html') || ['src','assets'].some(dir => file.startsWith(path.join(root,dir)+path.sep));
    if (!allowed) { res.writeHead(404);res.end('Not found');return; }
    const body = await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});
    res.end(body);
  } catch { res.writeHead(404);res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Feeling is ready: http://localhost:${port}`));
