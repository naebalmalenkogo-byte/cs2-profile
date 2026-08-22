/* ============================================================
   CS2 PROFILE — frontend logic
   ============================================================ */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* ---------- DEMO DATA (используется без API-ключей) ---------- */
  const DEMO = {
    name: 'ТВОЙ PROFILE',
    steamId: '',
    country: '',
    countryEmoji: '',
    steamLevel: 0,
    created: '',
    cyber: { rating: 1847, tier: 9, tierName: 'IX ранг' },
    premier: { rating: 21450, tierName: '25 000' },
    faceit: { level: 9, elo: 2145, tierName: 'Мастер' },
    totalHours: 3142,
    all: {
      kills: 48312, headshots: 31087, hsPercent: 64.3, accuracy: 26.1,
      kd: 1.43, matches: 2300, wins: 1342, losses: 958, winrate: 58.3,
      mvps: 687, clutches: 214, aces: 47, plants: 351, firstKills: 6102, headshotsHit: 18794,
    },
    month: {
      kills: 1204, headshots: 803, hsPercent: 66.7, accuracy: 27.9,
      kd: 1.57, matches: 118, wins: 74, losses: 44, winrate: 62.7,
      mvps: 39, clutches: 14, aces: 5, plants: 31, firstKills: 158, headshotsHit: 512,
    },
    months: ['Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
    killsByMonth: [320, 385, 412, 468, 395, 442, 510, 556, 601, 478, 1052, 1204],
    accByMonth: [21.4, 22.1, 23.0, 22.6, 24.2, 23.8, 25.1, 24.6, 26.0, 25.3, 27.1, 27.9],
    matches: [
      { map: 'Mirage',  icon: '🗺', win: true,  score: '13 — 8',  k: 27, d: 14, a: 9,  hs: 71,  rating: '+27', date: 'Сегодня' },
      { map: 'Anubis',  icon: '🏜', win: true,  score: '13 — 10', k: 31, d: 18, a: 5,  hs: 64,  rating: '+31', date: 'Сегодня' },
      { map: 'Dust2',   icon: '🏙', win: false, score: '11 — 13', k: 22, d: 19, a: 11, hs: 58,  rating: '-14', date: 'Вчера' },
      { map: 'Inferno', icon: '🔥', win: true,  score: '13 — 5',  k: 34, d: 11, a: 7,  hs: 77,  rating: '+42', date: 'Вчера' },
      { map: 'Nuke',    icon: '☢', win: false, score: '9 — 13',  k: 18, d: 20, a: 6,  hs: 49,  rating: '-18', date: '2 дня назад' },
      { map: 'Ancient', icon: '🏛', win: true,  score: '13 — 9',  k: 26, d: 15, a: 8,  hs: 66,  rating: '+24', date: '3 дня назад' },
      { map: 'Mirage',  icon: '🗺', win: false, score: '10 — 13', k: 24, d: 21, a: 4,  hs: 61,  rating: '-12', date: '3 дня назад' },
      { map: 'Overpass',icon: '🌉', win: true,  score: '13 — 6',  k: 29, d: 12, a: 10, hs: 73,  rating: '+35', date: '4 дня назад' },
      { map: 'Vertigo', icon: '🏗', win: true,  score: '13 — 7',  k: 21, d: 13, a: 12, hs: 55,  rating: '+19', date: '5 дней назад' },
      { map: 'Dust2',   icon: '🏙', win: false, score: '12 — 14', k: 25, d: 23, a: 7,  hs: 62,  rating: '-16', date: '6 дней назад' },
    ],
    achievements: [
      { ico: '🃏', title: 'Ace Machine',      desc: '5 эйсов за месяц',        prog: 100 },
      { ico: '💀', title: 'One-Tap God',      desc: 'Голова — 66% киллов',    prog: 100 },
      { ico: '🕯', title: 'Clutch Master',    desc: '14 клатчей за месяц',     prog: 100 },
      { ico: '🎯', title: 'Deagle Prince',    desc: '600+ киллов с Deagle',    prog: 84 },
      { ico: '⚔', title: 'Киллер недели',     desc: '34 килла за один матч',   prog: 100 },
      { ico: '🌙', title: 'Night Owl',        desc: '300 часов ночью',         prog: 76 },
      { ico: '💣', title: 'Bomb Whisperer',   desc: '351 закладка бомбы',      prog: 100 },
      { ico: '🔥', title: 'Win Streak',       desc: '12 побед подряд',         prog: 72 },
    ],
  };

  /* ---------- STATE ---------- */
  let settings = loadSettings();
  let data = null;        // итоговый объект профиля
  let range = 'month';    // 'all' | 'month'

  const STORAGE_KEY = 'cs2profile:settings:v1';
  const AVATAR_FALLBACK = makeAvatar();

  /* ---------- КАПЧА ---------- */
  let captchaCode = '';
  const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  function drawCaptcha() {
    const c = $('#captcha');
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, c.width, c.height);

    captchaCode = '';
    for (let i = 0; i < 5; i++) captchaCode += CHARS[Math.floor(Math.random() * CHARS.length)];

    const colors = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'];
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * c.width, Math.random() * c.height);
      ctx.bezierCurveTo(
        Math.random() * c.width, Math.random() * c.height,
        Math.random() * c.width, Math.random() * c.height,
        Math.random() * c.width, Math.random() * c.height
      );
      ctx.stroke();
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.6;
      ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1.4, 1.4);
    }
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    for (let i = 0; i < 5; i++) {
      const x = 12 + i * 26;
      const y = 31 + Math.random() * 6 - 3;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.5);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.95;
      ctx.fillText(captchaCode[i], 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    $('#captcha-input').value = '';
  }

  function makeAvatar() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#7c3aed"/>
      </linearGradient></defs>
      <rect width="240" height="240" rx="52" fill="url(#g)"/>
      <text x="120" y="148" font-size="96" font-family="Arial" font-weight="bold" fill="#e0e7ff" text-anchor="middle">CS2</text>
      <circle cx="200" cy="42" r="18" fill="#22d3ee" opacity="0.85"/>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  function loadSettings() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
  }
  function saveSettings(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    settings = s;
  }

  /* ---------- HELPERS ---------- */
  const fmt = (n) => n.toLocaleString('ru-RU');

  function toast(msg, ms = 3200) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), ms);
  }

  function animateNum(el, target, { suffix = '', prefix = '', dec = 0 } = {}) {
    const dur = 900;
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = from + (target - from) * ease;
      el.textContent = prefix + val.toLocaleString('ru-RU', { maximumFractionDigits: dec, minimumFractionDigits: dec }) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- БАЗА ДАННЫХ (GitHub) ---------- */
  function ghRepoFromHost() {
    const h = location.hostname;
    const m = h.match(/^([^.]+)\.github\.io$/);
    if (!m) return null;
    const repo = location.pathname.split('/').filter(Boolean)[0] || '';
    return repo ? { owner: m[1], repo } : null;
  }

  async function loadStatsDB() {
    const gh = ghRepoFromHost();
    const sources = [
      './data/stats.json',
      gh ? `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/main/data/stats.json` : null,
      'https://raw.githubusercontent.com/REPO_OWNER/REPO_NAME/main/data/stats.json',
    ].filter(Boolean);
    for (const src of sources) {
      try {
        const r = await fetch(src, { cache: 'no-store' });
        if (!r.ok) continue;
        const j = await r.json();
        if (j && j.player && j.stats) return j;
      } catch (e) { /* next source */ }
    }
    return null;
  }

  /* ---------- СТАТИСТИКА ИЗ БАЗЫ ---------- */
  function applyDB(db) {
    if (!db) return;
    try {
      const p = db.player || {};
      const s = db.stats || {};
      if (p.nickname) data.name = p.nickname;
      if (p.country) data.countryEmoji = p.country;
      if (p.steamLevel) data.steamLevel = p.steamLevel;
      if (p.steamId) data.steamId = p.steamId;
      if (p.created) data.created = p.created;
      if (p.totalHours) data.totalHours = p.totalHours;
      if (s.cyber) data.cyber = { ...data.cyber, ...s.cyber };
      if (s.premier) data.premier = { ...data.premier, ...s.premier };
      if (s.faceit) data.faceit = { ...data.faceit, ...s.faceit };
      if (s.all) data.all = { ...data.all, ...s.all };
      if (s.month) data.month = { ...data.month, ...s.month };
      if (s.killsByMonth) data.killsByMonth = s.killsByMonth;
      if (s.accByMonth) data.accByMonth = s.accByMonth;
      if (s.matches) data.matches = s.matches;
      if (s.achievements) data.achievements = s.achievements;
      if (s.months) data.months = s.months;
    } catch (e) { console.warn('DB apply:', e); }
  }

  /* ---------- API (прокси через наш сервер) ---------- */
  async function fetchSteam() {
    const r = await fetch(`/api/steam?steamid=${encodeURIComponent(settings.steamid)}&key=${encodeURIComponent(settings.steamKey)}`);
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Steam API ошибка');
    const p = j.response?.players?.[0];
    if (!p) throw new Error('Игрок не найден в Steam');
    return p;
  }

  async function fetchSteamLevel() {
    const r = await fetch(`/api/steam-level?steamid=${encodeURIComponent(settings.steamid)}&key=${encodeURIComponent(settings.steamKey)}`);
    const j = await r.json();
    return j?.response?.player_level ?? null;
  }

  async function fetchFaceit() {
    const r = await fetch(`/api/faceit?nickname=${encodeURIComponent(settings.faceNick)}&key=${encodeURIComponent(settings.faceKey)}`);
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Faceit ошибка');
    return j;
  }

  /* ---------- BUILD PROFILE DATA ---------- */
  async function buildProfile() {
    const d = JSON.parse(JSON.stringify(DEMO));
    let real = false;

    try {
      const db = await loadStatsDB();
      if (db) {
        data = d;
        applyDB(db);
        return { ...d, avatar: d.avatar || AVATAR_FALLBACK, real, fromDB: true };
      }
    } catch (e) { console.warn('DB:', e); }

    if (settings?.steamKey && settings?.steamid) {
      try {
        const p = await fetchSteam();
        d.name = p.personaname || d.name;
        d.avatar = p.avatarfull;
        d.countryCode = p.loccountrycode;
        d.countryEmoji = countryEmoji(p.loccountrycode) || d.countryEmoji;
        d.steamId = p.steamid;
        const lvl = await fetchSteamLevel();
        if (lvl != null) d.steamLevel = lvl;
        real = true;
      } catch (e) {
        console.warn('Steam:', e.message);
        toast('Не удалось получить Steam: ' + e.message + '. Показана демо-статистика.');
      }
    }

    if (settings?.faceKey && settings?.faceNick) {
      try {
        const f = await fetchFaceit();
        d.faceit = { level: f.games?.cs2?.faceit_level ?? DEMO.faceit.level, elo: f.games?.cs2?.faceit_elo ?? DEMO.faceit.elo, tierName: faceitTier(f.games?.cs2?.faceit_level ?? DEMO.faceit.level) };
        if (!real && f.avatar) d.avatar = f.avatar;
        real = true;
      } catch (e) {
        console.warn('Faceit:', e.message);
        toast('Не удалось получить Faceit: ' + e.message);
      }
    }

    return { ...d, avatar: d.avatar || AVATAR_FALLBACK, real };
  }

  function countryEmoji(code) {
    if (!code || code.length !== 2) return null;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  }

  function faceitTier(lvl) {
    const names = { 1: 'Орех', 2: 'Бронза', 3: 'Серебро', 4: 'Серебро+', 5: 'Золото', 6: 'Золото+', 7: 'Платина', 8: 'Платина+', 9: 'Алмаз', 10: 'Мастер' };
    return names[lvl] || '';
  }

  /* ---------- RENDER: HERO ---------- */
  function renderHero() {
    $('#avatar').src = data.avatar;
    $('#nickname').textContent = data.name;
    $('#country').textContent = data.countryEmoji || '';
    $('#steam-level').textContent = data.steamLevel;

    $('#cyber-num').textContent = fmt(data.cyber.rating);
    $('#premier-num').textContent = fmt(data.premier.rating);
    $('#faceit-num').textContent = data.faceit.level + ' LVL';

    const meta = [];
    meta.push(`<span>🆔 ${data.steamId.slice(0, 8)}…${data.steamId.slice(-4)}</span>`);
    meta.push(`<span>🕐 ${data.created}</span>`);
    meta.push(`<span>⌛ ${fmt(data.totalHours)} ч в CS2</span>`);
    meta.push(`<span>🔗 <a href="https://steamcommunity.com/profiles/${data.steamId}" target="_blank" rel="noopener" style="color:var(--cyan)">steamcommunity.com</a></span>`);
    if (data.faceit) {
      meta.push(`<span>⚡ <a href="https://www.faceit.com/ru/players/${settings?.faceNick || data.name}" target="_blank" rel="noopener" style="color:var(--gold)">Faceit ${data.faceit.elo} ELO</a></span>`);
    }
    $('#hero-meta').innerHTML = meta.join('');

    $('#hero-side').innerHTML = `
      <div class="mini-stat"><div class="num" id="ms-wr">${data.all.winrate.toFixed(1)}%</div><div class="lbl">Winrate</div></div>
      <div class="mini-stat"><div class="num" id="ms-hs">${data.all.hsPercent.toFixed(1)}%</div><div class="lbl">Headshot</div></div>
      <div class="mini-stat"><div class="num" id="ms-kd">${data.all.kd.toFixed(2)}</div><div class="lbl">K / D</div></div>
    `;

    $('#connect-state-text').textContent = 'Steam связан';
    $('#connect-state .dot').classList.remove('off');
  }

  /* ---------- RENDER: STATS ---------- */
  function statCards() {
    const s = range === 'all' ? data.all : data.month;
    const d = range === 'all' ? null : data.all;

    const cards = [
      { icon: '💀', label: 'Убийств', value: s.kills, color: '#f87171', diff: d ? pct(s.kills, d.kills) : null, diffUp: s.kills >= d.kills },
      { icon: '🎯', label: 'Headshot %', value: s.hsPercent, suffix: '%', dec: 1, color: '#22d3ee', diff: d ? s.hsPercent - d.hsPercent : null, diffUp: s.hsPercent >= d.hsPercent },
      { icon: '🖱', label: 'Точность', value: s.accuracy, suffix: '%', dec: 1, color: '#a78bfa', diff: d ? s.accuracy - d.accuracy : null, diffUp: s.accuracy >= d.accuracy },
      { icon: '⚔', label: 'K / D', value: s.kd, dec: 2, color: '#34d399', diff: d ? s.kd - d.kd : null, diffUp: s.kd >= d.kd },
      { icon: '🏆', label: 'Побед', value: s.wins, color: '#fbbf24', diff: d ? pct(s.wins, d.wins) : null, diffUp: s.wins >= d.wins },
      { icon: '📈', label: 'Winrate', value: s.winrate, suffix: '%', dec: 1, color: '#4ade80' },
      { icon: '🎮', label: 'Матчей', value: s.matches, color: '#60a5fa' },
      { icon: '⭐', label: 'MVP', value: s.mvps, color: '#facc15', diff: d ? pct(s.mvps, d.mvps) : null, diffUp: s.mvps >= d.mvps },
    ];

    $('#grid-stats').innerHTML = cards.map((c, i) => `
      <div class="stat-card" style="animation-delay:${i * 60}ms">
        <div class="sc-glow" style="background:${c.color}"></div>
        ${c.diff != null ? `<div class="sc-diff ${c.diffUp ? 'diff-up' : 'diff-down'}">${c.diffUp ? '▲' : '▼'} ${fmt(Math.abs(c.diff))}${c.diff <= 3 ? '%' : ''}</div>` : ''}
        <div class="sc-icon">${c.icon}</div>
        <div class="sc-value" data-anim="${c.value}" data-dec="${c.dec || 0}" data-suffix="${c.suffix || ''}">0</div>
        <div class="sc-label">${c.label}</div>
      </div>`).join('');

    $$('#grid-stats .sc-value').forEach(el => {
      animateNum(el, parseFloat(el.dataset.anim), { dec: +el.dataset.dec, suffix: el.dataset.suffix });
    });
  }

  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function detailGrid() {
    const s = range === 'all' ? data.all : data.month;
    const items = [
      ['💀', 'Киллы', fmt(s.kills)],
      ['🧠', 'Хедшоты', fmt(s.headshots)],
      ['🎯', 'Выстрелы в голову', fmt(s.headshotsHit)],
      ['🤝', 'Ассисты', fmt(s.matches * 2 + 13)],
      ['🕳', 'Смертей', fmt(Math.round(s.kills / s.kd))],
      ['🔥', 'Первые киллы', fmt(s.firstKills)],
      ['💣', 'Закладки', fmt(s.plants)],
      ['🕯', 'Клатчи', fmt(s.clutches)],
      ['🃏', 'Эйсы', fmt(s.aces)],
      ['⚔', 'Серия побед', '12'],
      ['💥', 'ADR', '89.4'],
      ['🎢', 'HSP (выстр.)', s.hsPercent.toFixed(1) + '%'],
    ];
    $('#detail-grid').innerHTML = items.map(([i, l, v]) => `
      <div class="detail-item"><div class="di-value">${i} ${v}</div><div class="di-label">${l}</div></div>`).join('');
  }

  /* ---------- RENDER: CHARTS ---------- */
  function drawChart(svgId, values, { area = true, labels, suffix = '', color = '#22d3ee', color2 = '#a78bfa' } = {}) {
    const svg = $(svgId);
    const W = 800, H = 260, padL = 14, padR = 14, padT = 18, padB = 34;
    const iw = W - padL - padR, ih = H - padT - padB;
    const max = Math.max(...values) * 1.15;
    const min = Math.min(...values) * 0.75;
    const stepX = iw / (values.length - 1);
    const X = (i) => padL + stepX * i;
    const Y = (v) => padT + ih - ((v - min) / (max - min)) * ih;

    let line = '', grid = '', dots = '', labelsHtml = '';
    values.forEach((v, i) => {
      const x = X(i), y = Y(v);
      line += `${i === 0 ? 'M' : 'L'}${x},${y} `;
      dots += `<circle class="chart-dot" cx="${x}" cy="${y}" r="4.5" stroke="${i === values.length - 1 ? color : 'rgba(255,255,255,0.35)'}" data-val="${v}"></circle>`;
      if (i % 2 === 0) {
        grid += `<line class="chart-grid-line" x1="${x}" y1="${padT}" x2="${x}" y2="${H - padB}"></line>`;
        labelsHtml += `<text class="chart-label" x="${x}" y="${H - 10}" text-anchor="middle">${labels ? labels[i] : i}</text>`;
      }
    });
    grid += `<line class="chart-grid-line" x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}"></line>`;
    grid += `<line class="chart-grid-line" x1="${padL}" y1="${padT}" x2="${W - padR}" y2="${padT}"></line>`;

    const grad = `g-${svgId.slice(1)}`;
    const areaPath = area ? `${line}L${X(values.length - 1)},${H - padB}L${X(0)},${H - padB}Z` : '';

    svg.innerHTML = `
      <defs>
        <linearGradient id="${grad}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color2}"/>
        </linearGradient>
        <linearGradient id="${grad}-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${color}" stop-opacity="0.5"/><stop offset="1" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${grid}
      ${area ? `<path class="chart-area" fill="url(#${grad}-f)" d="${areaPath}"></path>` : ''}
      <path class="chart-line" stroke="url(#${grad})" d="${line}"></path>
      ${dots}
      ${labelsHtml}
    `;
  }

  function renderCharts() {
    drawChart('#kills-chart', data.killsByMonth, { labels: data.months, color: '#22d3ee', color2: '#3b82f6' });
    drawChart('#accuracy-chart', data.accByMonth, { labels: data.months, suffix: '%', color: '#a78bfa', color2: '#f472b6', area: true });
    const total = data.killsByMonth.reduce((a, b) => a + b, 0);
    $('#chart-kills-total').textContent = fmt(total) + ' за 12 месяцев';
  }

  /* ---------- RENDER: MATCHES ---------- */
  function renderMatches() {
    $('#matches-sub').textContent = `${data.matches.length} последних матчей`;
    $('#matches-body').innerHTML = data.matches.map(m => `
      <tr>
        <td><div class="mt-map"><span class="map-ico">${m.icon}</span>${m.map}</div></td>
        <td class="${m.win ? 'result-win' : 'result-loss'}">${m.win ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'}</td>
        <td style="font-family:var(--font-mono)">${m.score}</td>
        <td><div class="kda"><b>${m.k}</b> / ${m.d} / ${m.a}</div></td>
        <td>
          <div class="hs-bar">
            <span style="font-family:var(--font-mono)">${m.hs}%</span>
            <div class="hs-fill"><i style="width:${m.hs}%"></i></div>
          </div>
        </td>
        <td><span class="rating-change ${m.rating.startsWith('+') ? 'rc-up' : 'rc-down'}">${m.rating}</span></td>
      </tr>`).join('');
  }

  /* ---------- RENDER: ACHIEVEMENTS ---------- */
  function renderAchievements() {
    $('#achieve-body').innerHTML = data.achievements.map(a => `
      <div class="achieve-item">
        <div class="a-ico">${a.ico}</div>
        <div style="flex:1">
          <div class="a-title">${a.title}</div>
          <div class="a-desc">${a.desc}</div>
          <div class="a-progress"><i style="width:${a.prog}%"></i></div>
        </div>
      </div>`).join('');
  }

  /* ---------- RENDER ALL ---------- */
  function render() {
    if (!data) return;
    renderHero();
    statCards();
    detailGrid();
    renderCharts();
    renderMatches();
    renderAchievements();
  }

  function switchTab(tab) {
    $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $$('.content > section, .content > .card, .content > .achieve-grid, .content > .charts').forEach(s => {
      const ids = s.id ? s.id.split(' ') : [];
      const show = tab === 'overview' || ids.includes('tab-' + tab) || ids.includes('tab-overview');
      s.classList.toggle('hidden', !show);
    });
    const hero = $('#tab-overview');
    if (hero) hero.classList.toggle('hidden', false);
  }

  function setRange(r) {
    range = r;
    $$('#range-seg .seg-btn, #range-seg-2 .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.range === r));
    statCards();
    detailGrid();
  }

  /* ---------- ONBOARDING ---------- */
  function showOnboarding() {
    $('#dashboard').classList.add('hidden');
    $('#onboarding').classList.remove('hidden');
    if (settings) {
      $('#steamid').value = settings.steamid || '';
      $('#steamkey').value = settings.steamKey || '';
      $('#facenick').value = settings.faceNick || '';
      $('#facekey').value = settings.faceKey || '';
    }
  }

  async function connect(ev) {
    ev.preventDefault();
    const err = $('#form-error');
    err.textContent = '';
    const steamid = $('#steamid').value.trim();
    const steamKey = $('#steamkey').value.trim();
    const faceNick = $('#facenick').value.trim();
    const faceKey = $('#facekey').value.trim();

    if (!steamid) { err.textContent = 'Введи Steam ID или ссылку на профиль'; return; }

    const captcha = $('#captcha-input').value.trim().toUpperCase();
    if (!captcha) { err.textContent = 'Введи код с картинки (капча)'; drawCaptcha(); return; }
    if (captcha !== captchaCode) { err.textContent = 'Неверный код капчи, попробуй ещё раз'; drawCaptcha(); return; }

    saveSettings({ steamid, steamKey, faceNick, faceKey });

    const btn = $('#connect-btn');
    btn.disabled = true;
    $('#connect-btn .btn-label').classList.add('hidden');
    $('#connect-btn .btn-spinner').classList.remove('hidden');

    try {
      data = await buildProfile();
      $('#onboarding').classList.add('hidden');
      $('#dashboard').classList.remove('hidden');
      render();
      switchTab('overview');
      setRange('month');
      toast('Профиль подключён!', 3500);
    } catch (e) {
      err.textContent = 'Ошибка: ' + e.message;
    } finally {
      btn.disabled = false;
      $('#connect-btn .btn-label').classList.remove('hidden');
      $('#connect-btn .btn-spinner').classList.add('hidden');
    }
  }

  /* ---------- ЗАЩИТА ОТ КОПИРОВАНИЯ ---------- */
  function initProtection() {
    const wm = $('#watermark');
    const isEditable = (t) => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      toast('⛔ Копирование отключено');
      flashGuard();
    });

    document.addEventListener('dragstart', (e) => { if (!isEditable(e.target)) e.preventDefault(); });
    document.addEventListener('selectstart', (e) => { if (!isEditable(e.target)) e.preventDefault(); });
    document.addEventListener('copy', (e) => { if (!isEditable(e.target)) { e.preventDefault(); toast('⛔ Копирование отключено'); flashGuard(); } });
    document.addEventListener('cut', (e) => { if (!isEditable(e.target)) e.preventDefault(); });
    document.addEventListener('paste', (e) => { if (!isEditable(e.target)) e.preventDefault(); });

    const keys = new Set(['c', 'x', 's', 'p', 'u', 'a']);
    window.addEventListener('keydown', (e) => {
      const ed = isEditable(e.target);
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'S', 'K'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        toast('⛔ Инструменты разработчика отключены');
        flashGuard();
        return;
      }
      if (ed && ['c', 'x', 'a', 'v'].includes(e.key.toLowerCase())) return;
      if (e.ctrlKey && keys.has(e.key.toLowerCase())) e.preventDefault();
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) e.preventDefault();
    });

    let devtoolsOpen = false, devOffense = 0;
    const devCheck = () => {
      const w = window.outerWidth - window.innerWidth > 160;
      const h = window.outerHeight - window.innerHeight > 160;
      if ((w || h) && !devtoolsOpen) {
        devtoolsOpen = true;
        devOffense++;
        toast('⛔ Обнаружен инструмент разработчика');
        flashGuard();
        wm.textContent = 'НЕ КОПИРУЙ МОЙ САЙТ © ' + (data ? data.name : 'CS2 PROFILE');
        if (devOffense >= 3) {
          document.body.style.filter = 'blur(6px)';
          setTimeout(() => { document.body.style.filter = ''; }, 8000);
        }
      } else if (!w && !h && devtoolsOpen) {
        devtoolsOpen = false;
        document.body.style.filter = '';
      }
    };
    setInterval(devCheck, 1200);

    const armWatermark = () => {
      wm.dataset.text = (data ? data.name : 'CS2 PROFILE') + ' — ПРОФИЛЬ ЗАЩИЩЁН —';
      wm.classList.add('armed');
    };
    document.addEventListener('mouseleave', () => { wm.textContent = '© CS2 PROFILE — КОПИРОВАНИЕ ЗАПРЕЩЕНО'; armWatermark(); });
    window.addEventListener('blur', () => { wm.textContent = '© CS2 PROFILE — КОПИРОВАНИЕ ЗАПРЕЩЕНО'; armWatermark(); });
    document.addEventListener('mouseenter', () => { wm.textContent = ''; armWatermark(); });
    window.addEventListener('focus', () => { wm.textContent = ''; armWatermark(); });
    armWatermark();
  }

  let guardTimer;
  function flashGuard() {
    const g = $('#guard');
    g.classList.add('show');
    clearTimeout(guardTimer);
    guardTimer = setTimeout(() => g.classList.remove('show'), 1600);
  }

  /* ---------- PARTICLES ---------- */
  function particles() {
    const canvas = $('#particles');
    const ctx = canvas.getContext('2d');
    let w, h, pts = [];
    const COLORS = ['#22d3ee', '#3b82f6', '#a78bfa', '#f472b6'];

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      pts = Array.from({ length: Math.min(70, Math.floor(w / 22)) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6, c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.55;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize();
    tick();
  }

  /* ---------- INIT ---------- */
  particles();
  initProtection();
  drawCaptcha();
  $('#captcha-refresh').addEventListener('click', drawCaptcha);
  $('#captcha').addEventListener('click', drawCaptcha);

  $('#connect-form').addEventListener('submit', connect);
  $('#reconnect-btn').addEventListener('click', showOnboarding);

  $$('.tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $$('#range-seg .seg-btn, #range-seg-2 .seg-btn').forEach(b => b.addEventListener('click', () => setRange(b.dataset.range)));

  /* авто-вход, если уже привязан, иначе — экран подключения */
  (async () => {
    if (settings && settings.steamid) {
      $('#onboarding').classList.add('hidden');
      $('#dashboard').classList.remove('hidden');
      $('#connect-state-text').textContent = 'Подключение…';
      data = await buildProfile();
      render();
      switchTab('overview');
      setRange('month');
    } else {
      showOnboarding();
    }
  })();
})();