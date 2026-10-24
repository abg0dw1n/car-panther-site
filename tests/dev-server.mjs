// Local preview server: serves the site and runs the forum API with an in-memory store.
// Run from the repo root:  node tests/dev-server.mjs   then open http://localhost:3000
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

delete process.env.BLOB_READ_WRITE_TOKEN;
process.env.FORUM_ADMIN_KEY ||= 'dev-admin';
const { GET, POST } = await import('../api/forum.js');
const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT || 3000);

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === '/api/forum') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: { ...req.headers, 'x-forwarded-for': req.socket.remoteAddress }, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
    const out = await (req.method === 'POST' ? POST(request) : GET(request));
    res.writeHead(out.status, Object.fromEntries(out.headers));
    res.end(await out.text());
    return;
  }
  const file = normalize(join(root, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, () => console.log(`Preview at http://localhost:${port}`));
