const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function send(res, status, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': typeof data === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

function proxyReq(url, headers, cb) {
  const req = https.get(url, { headers }, (res) => {
    let data = '';
    res.on('data', (c) => { data += c; });
    res.on('end', () => cb(null, res.statusCode, data));
  });
  req.on('error', (e) => cb(e));
  req.setTimeout(10000, () => req.destroy(new Error('timeout')));
}

function parseSteamId(raw) {
  if (!raw) return null;
  const s = raw.trim();
  const steamid64 = s.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (steamid64) return steamid64[1];
  if (/^\d{17}$/.test(s)) return s;
  return null;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  if (p === '/api/steam') {
    const key = url.searchParams.get('key');
    const steamid = parseSteamId(url.searchParams.get('steamid'));
    if (!key || !steamid) return send(res, 400, { error: 'Нужен Steam ID и API ключ' });
    const u = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${encodeURIComponent(key)}&steamids=${steamid}`;
    return proxyReq(u, {}, (err, code, body) => {
      if (err) return send(res, 502, { error: 'Steam API недоступен' });
      try { send(res, 200, JSON.parse(body)); }
      catch { send(res, 502, { error: 'Неверный ответ Steam API (проверь ключ)' }); }
    });
  }

  if (p === '/api/faceit') {
    const key = url.searchParams.get('key');
    const nickname = url.searchParams.get('nickname');
    if (!key || !nickname) return send(res, 400, { error: 'Нужен ник Faceit и API ключ' });
    const u = `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`;
    return proxyReq(u, { Authorization: 'Bearer ' + key }, (err, code, body) => {
      if (err) return send(res, 502, { error: 'Faceit API недоступен' });
      try {
        const json = JSON.parse(body);
        if (json.errors) return send(res, code || 404, { error: json.errors[0]?.message || 'Faceit: игрок не найден' });
        send(res, 200, json);
      } catch { send(res, 502, { error: 'Неверный ответ Faceit API (проверь ключ)' }); }
    });
  }

  if (p === '/api/steam-level') {
    const key = url.searchParams.get('key');
    const steamid = parseSteamId(url.searchParams.get('steamid'));
    if (!key || !steamid) return send(res, 400, { error: 'missing' });
    const u = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${encodeURIComponent(key)}&steamid=${steamid}`;
    return proxyReq(u, {}, (err, code, body) => {
      if (err) return send(res, 502, { error: 'Steam API недоступен' });
      try { send(res, 200, JSON.parse(body)); }
      catch { send(res, 502, { error: 'bad' }); }
    });
  }

  let filePath;
  if (p.startsWith('/data/')) {
    filePath = path.join(__dirname, p);
  } else {
    filePath = path.join(PUBLIC_DIR, p === '/' ? 'index.html' : p);
  }
  if (!filePath.startsWith(PUBLIC_DIR) && !filePath.startsWith(path.join(__dirname, 'data'))) return send(res, 403, 'Forbidden');
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`CS2 Profile app: http://localhost:${PORT}`);
});
