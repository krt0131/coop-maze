// 4인 협동 미로 탈출 - 게임 화면
'use strict';

// ---------------- 데이터 ----------------
const STAGES = [
  { name: '쉬움', map: ["###########","#S..#...#.#","###.#.#.#.#","#...#.#...#","#.###.###.#","#.#...#...#","#.#.###.###","#...#....E#","###########"] },
  { name: '보통', map: ["###############","#S..#.....#...#","###.###.#.###.#","#...#...#.....#","#.###.#######.#","#.#.....#.#...#","#.#####.#.#.###","#...#...#...#.#","###.#.###.###.#","#.....#......E#","###############"] },
  { name: '어려움', map: ["#####################","#S#...........#...#.#","#.###.#######.#.#.#.#","#...#.....#.....#.#.#","###.###.#.#.#####.#.#","#.#...#.#.#.#...#...#","#.###.###.###.#.###.#","#...#...#.#...#.#.#.#","#.#.###.#.#.###.#.#.#","#.#.....#...#...#...#","#.###########.###.###","#.............#....E#","#####################"] },
];

const DIRS = ['up', 'right', 'down', 'left'];
const P = {
  up:    { label: '위',     arrow: '↑', color: '#FF6B6B', dx: 0,  dy: -1, note: 659 },
  right: { label: '오른쪽', arrow: '→', color: '#FFB547', dx: 1,  dy: 0,  note: 587 },
  down:  { label: '아래',   arrow: '↓', color: '#2EC4B6', dx: 0,  dy: 1,  note: 440 },
  left:  { label: '왼쪽',   arrow: '←', color: '#7C6CF2', dx: -1, dy: 0,  note: 523 },
};
const C = {
  bg: '#F4F1EA', ink: '#2B2D42', muted: '#8A8C9E', floor: '#FFFDF8',
  wall: '#34374F', wallShade: '#1F2133', exit: '#3DDC84', panel: '#FFFFFF',
};
const FONT = '"Pretendard","Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';

// ---------------- 상태 ----------------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;

let state = 'lobby';         // lobby | countdown | play | clear | result
let stateT = 0;              // 상태 진입 시각(ms)
let stageIdx = 0;
let maze = null;             // { grid, cols, rows, start, exit }
let slots = { up: null, right: null, down: null, left: null };
let connected = false;

const char = { x: 0, y: 0, fx: 0, fy: 0, t0: 0, face: 'right', bump: null, by: null };
const MOVE_MS = 120;
let queue = [];
let trail = [];
let particles = [];
let stageStart = 0;
let stageTimes = [];
let stats = {};
let lastActivity = performance.now();
let bestTotal = null;
let newRecord = false;

const cards = {};
for (const d of DIRS) cards[d] = { pulse: 0, shake: 0, wrong: 0 };

try { const b = Number(localStorage.getItem('maze-best')); if (b > 0) bestTotal = b; } catch (e) {}

// ---------------- 유틸 ----------------
const now = () => performance.now();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);
function fmt(ms) {
  if (ms == null) return '--:--.--';
  const s = ms / 1000, m = Math.floor(s / 60), r = s - m * 60;
  return `${String(m).padStart(2, '0')}:${r.toFixed(2).padStart(5, '0')}`;
}
function post(path, body) {
  return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
    .then(r => r.json()).catch(() => ({}));
}
function joinedCount() { return DIRS.filter(d => slots[d]).length; }

// ---------------- 사운드 ----------------
let AC = null;
const soundEl = document.getElementById('sound');
function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(freq, dur = 0.08, type = 'sine', vol = 0.18, when = 0) {
  if (!soundEl.checked || !AC || AC.state !== 'running') return;
  const t = AC.currentTime + when;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
const sfx = {
  move: d => tone(P[d].note, 0.09, 'triangle', 0.2),
  bump: () => { tone(110, 0.12, 'square', 0.08); tone(90, 0.1, 'sine', 0.15, 0.02); },
  wrong: () => tone(220, 0.1, 'sawtooth', 0.05),
  join: () => { tone(523, 0.08); tone(784, 0.12, 'sine', 0.18, 0.08); },
  beep: hi => tone(hi ? 880 : 440, hi ? 0.25 : 0.12, 'sine', 0.2),
  clear: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.2, i * 0.09)),
  win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.2, i * 0.11)),
};
addEventListener('pointerdown', audio);

// ---------------- 미로 ----------------
function loadStage(i) {
  stageIdx = i;
  const map = STAGES[i].map;
  const grid = map.map(r => [...r]);
  let start, exit;
  grid.forEach((row, y) => row.forEach((c, x) => {
    if (c === 'S') start = { x, y };
    if (c === 'E') exit = { x, y };
  }));
  maze = { grid, cols: grid[0].length, rows: grid.length, start, exit };
  // 출구까지 거리표 (도우미 봇 길찾기용)
  const dist = grid.map(r => r.map(() => Infinity));
  dist[exit.y][exit.x] = 0;
  const q = [exit];
  while (q.length) {
    const c = q.shift();
    for (const d of DIRS) {
      const nx = c.x + P[d].dx, ny = c.y + P[d].dy;
      if (grid[ny] && grid[ny][nx] && grid[ny][nx] !== '#' && dist[ny][nx] === Infinity) {
        dist[ny][nx] = dist[c.y][c.x] + 1; q.push({ x: nx, y: ny });
      }
    }
  }
  maze.dist = dist;
  botPlan = null; waitHuman = null; lastBotDir = null;
  char.x = char.fx = start.x; char.y = char.fy = start.y;
  char.t0 = 0; char.bump = null; char.face = 'right';
  queue = []; trail = [];
}
// ---------------- 도우미 봇 ----------------
// 빈 자리(참가자 없는 방향)는 봇이 맡음. 출구까지 최단 경로의 다음 방향이
// 봇 담당이면 잠깐 뒤 대신 1칸 이동, 사람 담당이면 그 사람을 기다림.
let botPlan = null;    // { dir, at }
let waitHuman = null; // { dir, since }
let lastBotDir = null;
const isBot = d => !slots[d];
const hasBots = () => DIRS.some(isBot);

function nextDir() {
  const d0 = maze.dist[char.y][char.x];
  for (const d of DIRS) {
    const nx = char.x + P[d].dx, ny = char.y + P[d].dy;
    if (!isWall(nx, ny) && maze.dist[ny][nx] === d0 - 1) return d;
  }
  return null;
}

function updateBots(t) {
  const idle = !queue.length && (!char.t0 || t - char.t0 >= MOVE_MS) && !char.bump;
  if (!idle) { botPlan = null; return; }
  const d = nextDir();
  if (!d) return;
  if (isBot(d)) {
    waitHuman = null;
    if (!botPlan || botPlan.dir !== d) {
      // 같은 방향으로 이어서 갈 때는 빠르게, 방향이 바뀌면 살짝 뜸 들이기
      const delay = lastBotDir === d ? 260 : 650 + Math.random() * 450;
      botPlan = { dir: d, at: t + delay };
    } else if (t >= botPlan.at) {
      botPlan = null;
      lastBotDir = d;
      cards[d].pulse = 1;
      stats[d].bot = true;
      queue.push(d);
    }
  } else {
    botPlan = null;
    lastBotDir = null;
    if (!waitHuman || waitHuman.dir !== d) waitHuman = { dir: d, since: t };
  }
}

function isWall(x, y) {
  return y < 0 || y >= maze.rows || x < 0 || x >= maze.cols || maze.grid[y][x] === '#';
}

// ---------------- 상태 전환 ----------------
function setState(s) {
  state = s; stateT = now();
  post('/phase', { phase: s });
}
function toLobby() {
  loadStage(0);
  stageTimes = [];
  setState('lobby');
}
function startRun() {
  stageTimes = [];
  stats = {};
  for (const d of DIRS) stats[d] = { moves: 0, bumps: 0, wrong: 0 };
  newRecord = false;
  loadStage(0);
  setState('countdown');
}
function nextStage() {
  if (stageIdx + 1 < STAGES.length) { loadStage(stageIdx + 1); setState('countdown'); }
  else finishRun();
}
function finishRun() {
  const total = stageTimes.reduce((a, b) => a + b, 0);
  if (!bestTotal || total < bestTotal) {
    newRecord = true;
    bestTotal = total;
    try { localStorage.setItem('maze-best', String(total)); } catch (e) {}
  }
  setState('result');
  sfx.win();
  burst(70);
}

// ---------------- 입력 ----------------
function handleSwipe(slot, dir) {
  lastActivity = now();
  const card = cards[slot];
  if (state === 'play') {
    if (dir === slot) { card.pulse = 1; queue.length < 3 && queue.push(slot); }
    else { card.wrong = 1; card.shake = 1; stats[slot] && stats[slot].wrong++; sfx.wrong(); }
  } else if (state === 'lobby') {
    card.pulse = 1;
    if (dir === slot) sfx.move(slot);
  } else if (state === 'result') {
    card.pulse = 1;
    if (now() - stateT > 4000) startRun();
  } else {
    card.pulse = 1;
  }
}

function stepChar(slot) {
  const p = P[slot];
  const nx = char.x + p.dx, ny = char.y + p.dy;
  char.face = slot;
  if (isWall(nx, ny)) {
    char.bump = { dx: p.dx, dy: p.dy, t0: now() };
    cards[slot].shake = 1;
    stats[slot].bumps++;
    sfx.bump();
    return;
  }
  char.fx = char.x; char.fy = char.y;
  char.x = nx; char.y = ny;
  char.t0 = now(); char.by = slot;
  trail.push({ x: char.fx, y: char.fy, color: p.color });
  if (trail.length > 80) trail.shift();
  stats[slot].moves++;
  sfx.move(slot);
  if (nx === maze.exit.x && ny === maze.exit.y) {
    stageTimes.push(now() - stageStart);
    queue = [];
    setTimeout(() => { sfx.clear(); burst(40); }, MOVE_MS);
    setState('clear');
  }
}

// 서버 이벤트
function connect() {
  const es = new EventSource('/events');
  es.onopen = () => { connected = true; post('/phase', { phase: state }); };
  es.onerror = () => { connected = false; };
  es.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.t === 'slots') {
      const before = joinedCount();
      for (const d of DIRS) if (!slots[d] && m.slots[d]) { cards[d].pulse = 1; sfx.join(); }
      slots = m.slots;
      if (joinedCount() !== before) lastActivity = now();
    } else if (m.t === 'swipe') {
      handleSwipe(m.slot, m.dir);
    } else if (m.t === 'shutdown') {
      es.close(); showShutdown();
    } else if (m.t === 'tunnel') {
      loadInfo(); // 터널 주소가 생기거나 끊기면 QR 다시 만들기
    } else if (m.t === 'start') {
      // 폰의 '지금 시작' / '다시 도전' 버튼
      if ((state === 'lobby' && joinedCount() > 0) || state === 'result') { lastActivity = now(); startRun(); }
    }
  };
}

const KEYMAP = {
  ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left',
  w: 'up', d: 'right', s: 'down', a: 'left', W: 'up', D: 'right', S: 'down', A: 'left',
};
addEventListener('keydown', e => {
  audio();
  if (e.target && e.target.tagName === 'SELECT') return;
  const k = e.key;
  if (KEYMAP[k]) {
    e.preventDefault();
    handleSwipe(KEYMAP[k], KEYMAP[k]);
    return;
  }
  if (k === 'Enter') {
    if (state === 'lobby' || state === 'result') startRun();
  } else if (k === 'Escape') {
    // 설정 창이 열려 있으면 창만 닫고, 아니면 처음 화면으로
    if (settingsEl.classList.contains('open')) settingsEl.classList.remove('open');
    else toLobby();
  } else if (k === 'r' || k === 'R') {
    post('/reset'); toLobby();
  } else if (k === 'f' || k === 'F') {
    toggleFull();
  } else if (k === 'n' || k === 'N') {
    if (state === 'play') { stageTimes.push(now() - stageStart); setState('clear'); }
  } else if (k === 'Tab') {
    e.preventDefault(); toggleSettings();
  }
});

// ---------------- 설정 패널 ----------------
const settingsEl = document.getElementById('settings');
function toggleSettings() { settingsEl.classList.toggle('open'); }
function toggleFull() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
}
document.getElementById('gear').onclick = toggleSettings;
// 게임 종료: 실수 방지로 3초 안에 두 번 눌러야 종료
const quitBtn = document.getElementById('quitBtn');
let quitArmed = 0;
quitBtn.onclick = async () => {
  if (now() - quitArmed > 3000) {
    quitArmed = now();
    quitBtn.textContent = '정말 종료? 한 번 더 누르기';
    setTimeout(() => { if (now() - quitArmed >= 3000) quitBtn.textContent = '게임 종료'; }, 3100);
    return;
  }
  quitBtn.disabled = true;
  await post('/shutdown');
  showShutdown();
};
function showShutdown() {
  document.body.innerHTML =
    '<div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;' +
    'font-family:' + FONT.replace(/"/g, "'") + ';color:#2B2D42;background:#F4F1EA">' +
    '<div style="font-size:40px;font-weight:800">게임이 종료됐어요</div>' +
    '<div style="font-size:18px;color:#8A8C9E">서버와 인터넷 터널이 꺼졌어요. 이 탭은 닫아도 돼요.</div>' +
    '<div style="font-size:15px;color:#8A8C9E">다시 하려면 게임실행.bat을 실행하세요.</div></div>';
}
document.getElementById('closeSettings').onclick = () => settingsEl.classList.remove('open');
// 설정 창 바깥(게임 화면)을 클릭해도 닫힘
cv.addEventListener('pointerdown', () => settingsEl.classList.remove('open'));
document.getElementById('resetSlots').onclick = () => { post('/reset'); toLobby(); };
document.getElementById('toLobby').onclick = toLobby;
document.getElementById('fullscreen').onclick = toggleFull;

// QR
let padURL = '';
let qrMods = null;
const ipSel = document.getElementById('ipSel');
function makeQR(url) {
  padURL = url;
  try {
    const q = qrcode(0, 'M');
    q.addData(url); q.make();
    const n = q.getModuleCount();
    qrMods = { n, dark: (r, c) => q.isDark(r, c) };
  } catch (e) { qrMods = null; }
}
// QR 주소 후보: 인터넷 터널(있으면 1순위) + 같은 Wi-Fi용 IP들
let tunnelState = 'off';
let usingTunnel = false;
function loadInfo() {
  return fetch('/info').then(r => r.json()).then(info => {
    tunnelState = info.tunnelState || 'off';
    const host = location.hostname;
    let ips = info.ips || [];
    if (host !== 'localhost' && host !== '127.0.0.1' && host !== '::1' && !ips.includes(host)) ips = [host, ...ips];
    const opts = [];
    if (info.tunnel) opts.push({ v: info.tunnel, label: '인터넷 (LTE/5G 가능) — 추천' });
    for (const ip of ips) opts.push({ v: `http://${ip}:${info.port}`, label: `같은 Wi-Fi · ${ip}` });
    if (!opts.length) opts.push({ v: location.origin, label: location.origin });

    let saved = null;
    try { saved = localStorage.getItem('maze-base'); } catch (e) {}
    ipSel.innerHTML = opts.map(o => `<option value="${o.v}">${o.label}</option>`).join('');
    // 터널이 새로 생기면 항상 터널 우선, 아니면 이전 선택 유지
    if (info.tunnel) ipSel.value = info.tunnel;
    else if (saved && opts.some(o => o.v === saved)) ipSel.value = saved;
    applyQR();
  }).catch(() => { makeQR(location.origin + '/pad'); });
}
function applyQR() {
  usingTunnel = /trycloudflare\.com/.test(ipSel.value);
  makeQR(ipSel.value + '/pad');
}
ipSel.onchange = () => { try { localStorage.setItem('maze-base', ipSel.value); } catch (e) {} applyQR(); };
loadInfo();

// ---------------- 파티클 ----------------
function burst(n) {
  const cx = W / 2, cy = H * 0.4;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = (0.3 + Math.random()) * Math.min(W, H) * 0.012;
    particles.push({
      x: cx + (Math.random() - 0.5) * W * 0.5, y: cy + (Math.random() - 0.5) * H * 0.2,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - Math.min(W, H) * 0.008,
      r: Math.min(W, H) * (0.006 + Math.random() * 0.008), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      color: P[DIRS[i % 4]].color, life: 1,
    });
  }
}

// ---------------- 레이아웃 ----------------
let L = {};
function layout() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const u = Math.min(W, H);
  const pad = u * 0.025;
  const tbW = clamp(u * 0.34, 180, 520), tbH = clamp(u * 0.085, 48, 120);
  const sW = clamp(u * 0.13, 80, 200), sH = clamp(u * 0.22, 120, 300);
  L = { u, pad, tbW, tbH, sW, sH };
  L.card = {
    up:    { x: W / 2 - tbW / 2, y: pad, w: tbW, h: tbH, vertical: false },
    down:  { x: W / 2 - tbW / 2, y: H - pad - tbH, w: tbW, h: tbH, vertical: false },
    left:  { x: pad, y: H / 2 - sH / 2, w: sW, h: sH, vertical: true },
    right: { x: W - pad - sW, y: H / 2 - sH / 2, w: sW, h: sH, vertical: true },
  };
  L.area = { x: pad * 2 + sW, y: pad * 2 + tbH, w: W - (pad * 2 + sW) * 2, h: H - (pad * 2 + tbH) * 2 };
}
addEventListener('resize', layout);

function mazeGeom() {
  const a = L.area;
  const cs = Math.floor(Math.min(a.w / maze.cols, a.h / maze.rows));
  const mw = cs * maze.cols, mh = cs * maze.rows;
  return { cs, ox: Math.round(a.x + (a.w - mw) / 2), oy: Math.round(a.y + (a.h - mh) / 2), mw, mh };
}

// ---------------- 그리기 ----------------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(str, x, y, size, color, weight = 700, align = 'center', base = 'middle') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(str, x, y);
}

function drawMaze(t) {
  const { cs, ox, oy, mw, mh } = mazeGeom();
  // 바닥
  ctx.save();
  ctx.shadowColor = 'rgba(43,45,66,.18)'; ctx.shadowBlur = cs * 0.8; ctx.shadowOffsetY = cs * 0.25;
  rr(ox, oy, mw, mh, cs * 0.35); ctx.fillStyle = C.floor; ctx.fill();
  ctx.restore();

  // 출구
  const ex = ox + maze.exit.x * cs, ey = oy + maze.exit.y * cs;
  const glow = 0.5 + 0.5 * Math.sin(t / 300);
  ctx.save();
  ctx.shadowColor = C.exit; ctx.shadowBlur = cs * (0.4 + glow * 0.6);
  rr(ex + cs * 0.1, ey + cs * 0.1, cs * 0.8, cs * 0.8, cs * 0.2); ctx.fillStyle = C.exit; ctx.fill();
  ctx.restore();
  text('출구', ex + cs / 2, ey + cs / 2, cs * 0.3, '#fff', 800);

  // 출발점
  const sx = ox + maze.start.x * cs, sy = oy + maze.start.y * cs;
  ctx.beginPath(); ctx.arc(sx + cs / 2, sy + cs / 2, cs * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(43,45,66,.07)'; ctx.fill();

  // 지나온 길
  trail.forEach((p, i) => {
    const a = (i + 1) / trail.length;
    ctx.beginPath(); ctx.arc(ox + (p.x + 0.5) * cs, oy + (p.y + 0.5) * cs, cs * (0.06 + 0.06 * a), 0, Math.PI * 2);
    ctx.globalAlpha = 0.25 + a * 0.6; ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1;
  });

  // 벽 (그림자 → 본체)
  const sh = Math.max(2, cs * 0.12);
  ctx.fillStyle = C.wallShade;
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
    if (maze.grid[y][x] === '#') ctx.fillRect(ox + x * cs, oy + y * cs + Math.round(sh), cs, cs);
  }
  ctx.fillStyle = C.wall;
  for (let y = 0; y < maze.rows; y++) {
    // 가로로 이어진 벽은 한 번에 그려서 이음새 줄이 안 생기게
    let x = 0;
    while (x < maze.cols) {
      if (maze.grid[y][x] !== '#') { x++; continue; }
      let x2 = x;
      while (x2 + 1 < maze.cols && maze.grid[y][x2 + 1] === '#') x2++;
      ctx.fillRect(ox + x * cs, oy + y * cs, (x2 - x + 1) * cs, cs);
      x = x2 + 1;
    }
  }
  return { cs, ox, oy };
}

function drawChar(t, g) {
  const { cs, ox, oy } = g;
  const k = char.t0 ? clamp((t - char.t0) / MOVE_MS, 0, 1) : 1;
  const e = easeOut(k);
  let x = char.fx + (char.x - char.fx) * e;
  let y = char.fy + (char.y - char.fy) * e;
  if (char.bump) {
    const bk = (t - char.bump.t0) / 180;
    if (bk >= 1) char.bump = null;
    else { const o = Math.sin(bk * Math.PI) * 0.22; x += char.bump.dx * o; y += char.bump.dy * o; }
  }
  const cx = ox + (x + 0.5) * cs, cy = oy + (y + 0.5) * cs;
  const p = P[char.face];
  // 늘어남/찌그러짐
  const sq = k < 1 ? Math.sin(k * Math.PI) * 0.18 : 0;
  const sxs = 1 + (p.dx ? sq : -sq * 0.6), sys = 1 + (p.dy ? sq : -sq * 0.6);
  const r = cs * 0.36;

  ctx.save();
  ctx.translate(cx, cy);
  // 그림자
  ctx.beginPath(); ctx.ellipse(0, r * 0.95, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fill();
  ctx.scale(sxs, sys);
  // 움직인 사람 색 링
  if (char.by && k < 1) {
    ctx.beginPath(); ctx.arc(0, 0, r * (1.25 + k * 0.4), 0, Math.PI * 2);
    ctx.strokeStyle = P[char.by].color; ctx.globalAlpha = 1 - k; ctx.lineWidth = cs * 0.08; ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.lineWidth = Math.max(2, cs * 0.06); ctx.strokeStyle = C.ink; ctx.stroke();
  // 눈 (바라보는 방향)
  const lx = p.dx * r * 0.25, ly = p.dy * r * 0.2;
  const blink = (t % 3200) < 120 ? 0.2 : 1;
  ctx.fillStyle = C.ink;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(lx + s * r * 0.32, ly - r * 0.1, r * 0.11, r * 0.15 * blink, 0, 0, Math.PI * 2); ctx.fill();
  }
  // 볼
  ctx.fillStyle = 'rgba(255,107,107,.35)';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(lx + s * r * 0.55, ly + r * 0.22, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function drawCard(d, t) {
  const b = L.card[d], p = P[d], cd = cards[d];
  const joined = !!slots[d];
  const bot = !joined && state !== 'lobby';
  // 도우미가 있을 때, 사람 차례에서 3초 넘게 멈춰 있으면 '내 차례' 알림
  const myTurn = state === 'play' && joined && waitHuman && waitHuman.dir === d && hasBots() && t - waitHuman.since > 3000;
  const shake = cd.shake > 0 ? Math.sin(t / 18) * cd.shake * L.u * 0.012 : 0;
  const sc = 1 + cd.pulse * 0.08;
  ctx.save();
  ctx.translate(b.x + b.w / 2 + shake, b.y + b.h / 2);
  ctx.scale(sc, sc);
  const x = -b.w / 2, y = -b.h / 2, r = Math.min(b.w, b.h) * 0.28;

  if (myTurn) {
    const g = 0.5 + 0.5 * Math.sin(t / 150);
    rr(x - 8, y - 8, b.w + 16, b.h + 16, r + 8);
    ctx.lineWidth = 6; ctx.strokeStyle = p.color; ctx.globalAlpha = 0.3 + g * 0.7; ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (bot) {
    rr(x, y, b.w, b.h, r); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = p.color; ctx.stroke();
    if (cd.pulse > 0) { rr(x, y, b.w, b.h, r); ctx.fillStyle = p.color; ctx.globalAlpha = cd.pulse * 0.35; ctx.fill(); ctx.globalAlpha = 1; }
  } else if (joined) {
    ctx.save();
    ctx.shadowColor = 'rgba(43,45,66,.15)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
    rr(x, y, b.w, b.h, r); ctx.fillStyle = p.color; ctx.fill();
    ctx.restore();
    if (cd.pulse > 0) { rr(x, y, b.w, b.h, r); ctx.fillStyle = `rgba(255,255,255,${cd.pulse * 0.35})`; ctx.fill(); }
  } else {
    rr(x, y, b.w, b.h, r); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
    ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.strokeStyle = p.color; ctx.stroke(); ctx.setLineDash([]);
  }

  const fg = joined ? '#fff' : p.color;
  const sub = joined ? 'rgba(255,255,255,.85)' : C.muted;
  let status = joined ? '참가 완료' : '빈 자리';
  if (state !== 'lobby' && joined && stats[d]) status = `${stats[d].moves}칸 이동`;
  if (bot) status = '🤖 도우미';
  if (cd.wrong > 0) status = `${p.arrow} 방향만 가능!`;
  if (myTurn) status = `지금 ${p.arrow} 차례!`;

  if (b.vertical) {
    const s = b.w;
    text(p.arrow, 0, y + b.h * 0.3, s * 0.42, fg, 800);
    text(p.label, 0, y + b.h * 0.6, s * 0.17, fg, 800);
    text(status, 0, y + b.h * 0.8, s * 0.12, sub, 600);
  } else {
    const s = b.h;
    text(p.arrow, x + s * 0.55, 0, s * 0.6, fg, 800);
    text(p.label, x + s * 1.05, -s * 0.12, s * 0.3, fg, 800, 'left');
    text(status, x + s * 1.05, s * 0.22, s * 0.2, sub, 600, 'left');
  }
  ctx.restore();
}

function drawHUD(t) {
  const u = L.u, pad = L.pad;
  const elapsed = state === 'play' ? t - stageStart : state === 'clear' ? stageTimes[stageTimes.length - 1] : 0;
  const total = stageTimes.reduce((a, b) => a + b, 0) + (state === 'play' ? elapsed : 0);
  text(`STAGE ${stageIdx + 1}/${STAGES.length} · ${STAGES[stageIdx].name}`, pad * 1.2, pad * 1.4, u * 0.022, C.muted, 700, 'left');
  text(fmt(elapsed), pad * 1.2, pad * 1.4 + u * 0.045, u * 0.042, C.ink, 800, 'left');
  text('누적', W - pad * 1.2, pad * 1.4, u * 0.022, C.muted, 700, 'right');
  text(fmt(total), W - pad * 1.2, pad * 1.4 + u * 0.045, u * 0.042, C.ink, 800, 'right');
  if (!connected) text('서버 연결 끊김 - server.js가 켜져 있는지 확인하세요', W / 2, H - pad * 0.6, u * 0.018, '#E04848', 700);
}

function panel(w, h) {
  const x = W / 2 - w / 2, y = H / 2 - h / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(43,45,66,.25)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
  rr(x, y, w, h, L.u * 0.03); ctx.fillStyle = C.panel; ctx.fill();
  ctx.restore();
  return { x, y, w, h };
}
function dim(a = 0.35) { ctx.fillStyle = `rgba(244,241,234,${a})`; ctx.fillRect(0, 0, W, H); }

function drawLobby(t) {
  dim(0.55);
  const u = L.u;
  const w = Math.min(L.area.w * 1.05, u * 1.05), h = Math.min(L.area.h * 1.02, u * 0.62);
  const b = panel(w, h);
  const qs = Math.min(h * 0.72, w * 0.4);
  const qx = b.x + w * 0.06, qy = b.y + (h - qs) / 2 - h * 0.03;
  // QR
  if (qrMods) {
    const n = qrMods.n, q = 2, m = qs / (n + q * 2);
    ctx.fillStyle = '#fff'; ctx.fillRect(qx, qy, qs, qs);
    ctx.fillStyle = C.ink;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (qrMods.dark(r, c)) ctx.fillRect(qx + (c + q) * m, qy + (r + q) * m, Math.ceil(m), Math.ceil(m));
    }
  }
  // 주소가 길면(터널) QR 폭에 맞게 줄여서 표시
  ctx.font = `600 ${u * 0.017}px ${FONT}`;
  let shown = padURL.replace(/^https?:\/\//, '');
  if (ctx.measureText(shown).width > qs) {
    while (shown.length > 8 && ctx.measureText(shown + '…').width > qs) shown = shown.slice(0, -1);
    shown += '…';
  }
  text(shown, qx + qs / 2, qy + qs + h * 0.05, u * 0.017, C.muted, 600);
  if (usingTunnel) text('📶 Wi-Fi 없이 LTE/5G로도 접속돼요', qx + qs / 2, qy - h * 0.045, u * 0.018, '#22A866', 700);
  else if (tunnelState === 'starting') text('인터넷 주소 준비 중… (잠시 후 QR이 바뀌어요)', qx + qs / 2, qy - h * 0.045, u * 0.017, C.muted, 600);

  // 오른쪽 안내
  const tx = qx + qs + w * 0.06;
  let y = b.y + h * 0.18;
  text('4인 협동 미로 탈출', tx, y, u * 0.05, C.ink, 800, 'left');
  y += u * 0.06;
  text('네 명이 한 캐릭터를 함께 움직여요', tx, y, u * 0.024, C.muted, 600, 'left');
  y += u * 0.075;
  const steps = ['폰 카메라로 QR을 찍어요', '맡을 방향을 하나 골라요', '폰의 "지금 시작" 누르기 (4명이면 자동)'];
  steps.forEach((s, i) => {
    ctx.beginPath(); ctx.arc(tx + u * 0.018, y, u * 0.018, 0, Math.PI * 2); ctx.fillStyle = P[DIRS[i]].color; ctx.fill();
    text(String(i + 1), tx + u * 0.018, y + 1, u * 0.02, '#fff', 800);
    text(s, tx + u * 0.05, y, u * 0.026, C.ink, 700, 'left');
    y += u * 0.06;
  });
  y += u * 0.02;
  const n = joinedCount();
  text(`참가 ${n} / 4`, tx, y, u * 0.032, n === 4 ? '#22A866' : C.ink, 800, 'left');
  // 점 4개
  DIRS.forEach((d, i) => {
    ctx.beginPath(); ctx.arc(tx + u * 0.19 + i * u * 0.04, y, u * 0.013, 0, Math.PI * 2);
    ctx.fillStyle = slots[d] ? P[d].color : '#E2DFD7'; ctx.fill();
  });
  y += u * 0.05;
  text('빈 자리는 🤖 도우미가 대신 맡아요 · 혼자서도 OK!', tx, y, u * 0.019, C.ink, 600, 'left');
  y += u * 0.035;
  text(usingTunnel ? '화면을 한 번 클릭하면 효과음이 켜져요' : '같은 Wi-Fi에 연결해 주세요 · 화면을 한 번 클릭하면 효과음이 켜져요',
    tx, y, u * 0.016, C.muted, 500, 'left');

  // 4명 모이면 카운트다운
  if (n === 4) {
    if (!lobbyFullAt) lobbyFullAt = t;
    const left = 3 - Math.floor((t - lobbyFullAt) / 1000);
    text(`모두 모였어요! ${Math.max(left, 1)}초 후 시작`, W / 2, b.y + h - h * 0.07, u * 0.026, '#22A866', 800);
    if (t - lobbyFullAt > 3000) { lobbyFullAt = 0; startRun(); }
  } else lobbyFullAt = 0;
}
let lobbyFullAt = 0;

function drawCountdown(t) {
  const el = t - stateT;
  const u = L.u;
  dim(0.45);
  const b = panel(u * 0.42, u * 0.42);
  text(`STAGE ${stageIdx + 1}`, W / 2, b.y + b.h * 0.17, u * 0.04, C.ink, 800);
  text(STAGES[stageIdx].name, W / 2, b.y + b.h * 0.3, u * 0.028, C.muted, 700);
  const n = 3 - Math.floor(el / 800);
  const k = (el % 800) / 800;
  const label = n > 0 ? String(n) : '출발!';
  ctx.save();
  ctx.globalAlpha = n > 0 ? 1 - k * 0.6 : 1 - clamp((el - 2400) / 500, 0, 1);
  text(label, W / 2, b.y + b.h * 0.64, u * (n > 0 ? 0.16 - k * 0.03 : 0.1), n > 0 ? C.ink : '#22A866', 900);
  ctx.restore();
  if (n !== lastBeep) { lastBeep = n; sfx.beep(n <= 0); }
  if (el >= 2400 && state === 'countdown') {
    stageStart = now();
    queue = [];
    state = 'play'; stateT = now(); post('/phase', { phase: 'play' });
  }
}
let lastBeep = null;

function drawClear(t) {
  const el = t - stateT, u = L.u;
  if (el < MOVE_MS) return;
  dim(0.3);
  const b = panel(u * 0.7, u * 0.3);
  text(stageIdx + 1 < STAGES.length ? '탈출 성공!' : '마지막 미로 탈출!', W / 2, b.y + b.h * 0.3, u * 0.05, C.ink, 800);
  text(fmt(stageTimes[stageTimes.length - 1]), W / 2, b.y + b.h * 0.62, u * 0.06, '#22A866', 800);
  text(stageIdx + 1 < STAGES.length ? '다음 스테이지 준비…' : '결과 보러 가는 중…', W / 2, b.y + b.h * 0.86, u * 0.02, C.muted, 600);
  if (el > 3200) nextStage();
}

function drawResult(t) {
  const el = t - stateT, u = L.u;
  dim(0.6);
  const w = Math.min(W * 0.8, u * 1.1), h = Math.min(H * 0.82, u * 0.8);
  const b = panel(w, h);
  let y = b.y + h * 0.1;
  text('🎉 모든 미로 탈출! 🎉', W / 2, y, u * 0.05, C.ink, 800);
  const total = stageTimes.reduce((a, c) => a + c, 0);
  y += h * 0.13;
  text(fmt(total), W / 2, y, u * 0.075, '#22A866', 900);
  y += h * 0.08;
  text(newRecord ? '★ 최고 기록! ★' : `최고 기록 ${fmt(bestTotal)}`, W / 2, y, u * 0.022, newRecord ? '#FF8A3D' : C.muted, 800);

  // 스테이지별 기록
  y += h * 0.09;
  const colW = w * 0.24;
  stageTimes.forEach((s, i) => {
    const x = W / 2 + (i - (stageTimes.length - 1) / 2) * colW;
    text(`STAGE ${i + 1} · ${STAGES[i].name}`, x, y, u * 0.018, C.muted, 700);
    text(fmt(s), x, y + u * 0.035, u * 0.028, C.ink, 800);
  });

  // 기여도
  y += h * 0.17;
  text('누가 얼마나 움직였을까?', W / 2, y, u * 0.022, C.muted, 700);
  y += h * 0.07;
  const maxM = Math.max(1, ...DIRS.map(d => stats[d] ? stats[d].moves : 0));
  const barW = w * 0.5, rowH = h * 0.065;
  const k = easeOut(clamp(el / 1200, 0, 1));
  DIRS.forEach((d, i) => {
    const ry = y + i * rowH;
    const s = stats[d] || { moves: 0, bumps: 0 };
    text(`${P[d].arrow} ${P[d].label}`, W / 2 - barW / 2 - u * 0.02, ry, u * 0.02, P[d].color, 800, 'right');
    rr(W / 2 - barW / 2, ry - rowH * 0.28, barW, rowH * 0.56, rowH * 0.28); ctx.fillStyle = '#F0EDE6'; ctx.fill();
    const bw = Math.max(rowH * 0.56, barW * (s.moves / maxM) * k);
    rr(W / 2 - barW / 2, ry - rowH * 0.28, bw, rowH * 0.56, rowH * 0.28); ctx.fillStyle = P[d].color; ctx.fill();
    text(s.bot ? `${s.moves}칸 · 🤖 도우미` : `${s.moves}칸 · 벽꿍 ${s.bumps}`, W / 2 + barW / 2 + u * 0.02, ry, u * 0.018, C.muted, 700, 'left');
  });

  if (el > 4000) {
    const a = 0.5 + 0.5 * Math.sin(t / 300);
    ctx.globalAlpha = 0.5 + a * 0.5;
    text('아무나 드래그하면 다시 도전!  (Enter)', W / 2, b.y + h - h * 0.06, u * 0.022, C.ink, 700);
    ctx.globalAlpha = 1;
  }
}

function drawParticles() {
  for (const p of particles) {
    p.vy += L.u * 0.0006; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.006;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.globalAlpha = clamp(p.life, 0, 1); ctx.fillStyle = p.color;
    ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  particles = particles.filter(p => p.life > 0 && p.y < H + 50);
}

// ---------------- 루프 ----------------
let lastT = now();
function frame(t) {
  const dt = Math.min(50, t - lastT); lastT = t;
  for (const d of DIRS) {
    const c = cards[d];
    c.pulse = Math.max(0, c.pulse - dt / 250);
    c.shake = Math.max(0, c.shake - dt / 350);
    c.wrong = Math.max(0, c.wrong - dt / 1200);
  }
  // 이동 처리 (애니메이션 중이면 대기열에서 하나씩)
  if (state === 'play' && queue.length && (!char.t0 || t - char.t0 >= MOVE_MS) && !char.bump) {
    stepChar(queue.shift());
  }
  if (state === 'play') updateBots(t);
  // 전시용: 결과 화면에서 오래 방치되면 자리 비우고 처음으로
  if (state === 'result' && t - stateT > 45000 && t - lastActivity > 45000) { post('/reset'); toLobby(); }

  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const g = drawMaze(t);
  drawChar(t, g);
  for (const d of DIRS) drawCard(d, t);
  if (state !== 'lobby' && state !== 'result') drawHUD(t);
  if (state === 'lobby') drawLobby(t);
  else if (state === 'countdown') drawCountdown(t);
  else if (state === 'clear') drawClear(t);
  else if (state === 'result') drawResult(t);
  drawParticles();
  requestAnimationFrame(frame);
}

layout();
loadStage(0);
connect();
setState('lobby');
requestAnimationFrame(frame);
