// 4인 협동 미로 탈출 - 게임 화면
'use strict';

// ---------------- 데이터 ----------------
// 난이도마다 맵 여러 개 — 스테이지 시작 때 무작위로 하나 (같은 맵 연속 방지). 첫 번째는 원래 맵.
// 추가 맵은 원래 맵과 크기·경로 길이·꺾임 수가 비슷하도록 골라서 만든 것
const STAGES = [
  { name: '쉬움', maps: [
    ["###########","#S..#...#.#","###.#.#.#.#","#...#.#...#","#.###.###.#","#.#...#...#","#.#.###.###","#...#....E#","###########"],
    ["###########","#S..#.....#","###.###.#.#","#.#.#...#.#","#.#.#.###.#","#...#.#...#","#.###.#.###","#.....#..E#","###########"],
    ["###########","#S#.......#","#.###.###.#","#...#.#...#","###.#.#.###","#...#.#...#","#.###.###.#","#.....#..E#","###########"],
    ["###########","#S..#.....#","###.###.#.#","#...#...#.#","#.###.###.#","#.#...#...#","#.#.###.###","#...#....E#","###########"],
    ["###########","#S#.......#","#.#####.#.#","#...#...#.#","###.#.###.#","#...#...#.#","#.#####.#.#","#.......#E#","###########"],
    ["###########","#S..#.....#","###.#.###.#","#...#.#.#.#","#.###.#.#.#","#.#...#...#","#.#.###.###","#...#....E#","###########"],
  ] },
  { name: '보통', maps: [
    ["###############","#S..#.....#...#","###.###.#.###.#","#...#...#.....#","#.###.#######.#","#.#.....#.#...#","#.#####.#.#.###","#...#...#...#.#","###.#.###.###.#","#.....#......E#","###############"],
    ["###############","#S......#...#.#","#######.#.#.#.#","#.#...#.#.#...#","#.#.#.#.#.###.#","#...#...#.#...#","#.#######.#.#.#","#...#.....#...#","###.#.#####.###","#.....#......E#","###############"],
    ["###############","#S......#.....#","#######.###.#.#","#.....#.#...#.#","#.#.###.#.###.#","#.#.....#.#...#","#.#######.#.###","#...#...#.#.#.#","###.#.#.#.#.#.#","#.....#...#..E#","###############"],
    ["###############","#S#.....#.....#","#.###.#.#.###.#","#.....#...#.#.#","###########.#.#","#...#...#...#.#","#.#.#.#.#.#.#.#","#.#...#...#...#","#.#############","#............E#","###############"],
    ["###############","#S#...........#","#.###.#.#.###.#","#...#.#...#...#","###.###.###.###","#...#...#...#.#","#.###.###.###.#","#.....#...#...#","#######.###.#.#","#...........#E#","###############"],
    ["###############","#S..#.......#.#","###.###.###.#.#","#.#...#...#...#","#.###.#.#.###.#","#.....#.#...#.#","#.#########.#.#","#.#.....#...#.#","#.###.#.#.###.#","#.....#...#..E#","###############"],
  ] },
  { name: '어려움', maps: [
    ["#####################","#S#...........#...#.#","#.###.#######.#.#.#.#","#...#.....#.....#.#.#","###.###.#.#.#####.#.#","#.#...#.#.#.#...#...#","#.###.###.###.#.###.#","#...#...#.#...#.#.#.#","#.#.###.#.#.###.#.#.#","#.#.....#...#...#...#","#.###########.###.###","#.............#....E#","#####################"],
    ["#####################","#S..#...........#...#","###.#.#.#######.#.#.#","#...#.#.#.....#...#.#","#.###.###.###.#####.#","#...#.....#...#.....#","###.#######.###.#####","#.#...#...#.#...#...#","#.###.#.#.#.#.#####.#","#.#...#.#.#.#.#.....#","#.#.###.#.#.#.#.###.#","#.......#...#...#..E#","#####################"],
    ["#####################","#S#...#.......#.....#","#.###.#.###.#.#.###.#","#...#.....#.#.#...#.#","###.#######.#.###.#.#","#...#.......#.....#.#","#.###.#############.#","#.#.....#.........#.#","#.#####.#.#######.#.#","#.#.....#.#...#.#...#","#.#.#####.#.#.#.#####","#...#.......#......E#","#####################"],
    ["#####################","#S#.......#.........#","#.#####.#.#####.###.#","#...#...#.....#...#.#","###.#.#######.#.#.#.#","#.#...#.#.....#.#.#.#","#.#####.#.#####.#.#.#","#...#...#.#...#...#.#","#.#.#.#.#.#.#.#.###.#","#.#...#...#.#.#.#...#","#.#########.#.#.#.###","#...........#...#..E#","#####################"],
    ["#####################","#S..#.......#.......#","###.#####.#.#.#####.#","#...#...#.#...#...#.#","#.###.#.#.#####.###.#","#.#...#...#...#.....#","#.#.#.#####.#.#.#####","#.#.#.......#.#...#.#","#.#.#########.###.#.#","#.#...#...#...#...#.#","#.#####.#.#.###.###.#","#.......#...#......E#","#####################"],
    ["#####################","#S#.......#.........#","#.#.#####.###.#####.#","#.#...#.....#...#...#","#.###.#####.###.#.###","#...#...#...#...#.#.#","###.###.#.###.###.#.#","#.#.#...#.#...#.#...#","#.#.#.###.#.#.#.###.#","#.#...#.#.#.#.#.....#","#.#####.#.###.#.#####","#.............#....E#","#####################"],
  ] },
];

const DIRS = ['up', 'right', 'down', 'left'];
const P = {
  up:    { label: '위',     arrow: '↑', color: '#FF6B6B', dx: 0,  dy: -1, note: 659 },
  right: { label: '오른쪽', arrow: '→', color: '#FFB547', dx: 1,  dy: 0,  note: 587 },
  down:  { label: '아래',   arrow: '↓', color: '#2EC4B6', dx: 0,  dy: 1,  note: 440 },
  left:  { label: '왼쪽',   arrow: '←', color: '#7C6CF2', dx: -1, dy: 0,  note: 523 },
};
// ---------------- 테마 ----------------
// classic = 크림(기본), neon = 네온 회로. 색은 여기서만 바꾸면 화면 전체에 반영됨
const THEMES = {
  classic: {
    label: '크림', neon: false, dark: false, padK: 0.025,
    font: '"Pretendard","Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif',
    dirs: { up: '#FF6B6B', right: '#FFB547', down: '#2EC4B6', left: '#7C6CF2' },
    bg: '#F4F1EA', ink: '#2B2D42', muted: '#6E7287', floor: '#FFFDF8', line: '#ECE8DF',
    wall: '#34374F', wallShade: '#1F2133', exit: '#22B573', exitInk: '#FFFFFF', panel: '#FFFFFF',
    shadowRGB: '43,45,66', dimRGB: '244,241,234', good: '#22A866', track: '#ECE9E1',
    frozenFill: '#EEF4FF', frozenTrack: '#D5E3FF', chipBg: '#FFE8A3', chipInk: '#8A5A00',
    charFill: '#FFFFFF', charLine: '#2B2D42', charEye: '#2B2D42', badgeFill: '#FFFFFF',
    iceFill: '#C9ECFF', startMark: 'rgba(43,45,66,.07)', popupStroke: '#FFFFFF',
    danger: '#E04848', record: '#FF8A3D', emptyCard: 'rgba(255,255,255,.6)',
  },
  neon: {
    label: '네온', neon: true, dark: true, charGlow: true, padK: 0.025,
    font: '"Chakra Petch","IBM Plex Sans KR","Pretendard","Noto Sans KR","Malgun Gothic",sans-serif',
    dirs: { up: '#FF8FB7', right: '#F2B33A', down: '#4CF0C4', left: '#A77BFF' },
    bg: '#020711', bgTop: '#0B2342', ink: '#EAF2FF', muted: '#8FA3C8', floor: '#081129', line: 'rgba(127,140,255,.28)',
    wall: '#121C40', wallShade: '#0A1029', edgeA: '#58D5F2', edgeB: '#A77BFF',
    exit: '#4CF0C4', exitInk: '#03141A', panel: '#0B1330', panelTop: '#141D40',
    shadowRGB: '0,0,0', dimRGB: '2,7,17', good: '#4CF0C4', track: 'rgba(127,140,255,.16)',
    frozenFill: '#0E2152', frozenTrack: 'rgba(91,155,255,.25)', chipBg: 'rgba(255,200,61,.16)', chipInk: '#FFD86B',
    charFill: '#0E1838', charLine: '#58D5F2', charEye: '#EAF2FF', badgeFill: '#0D1532',
    iceFill: '#C9ECFF', startMark: 'rgba(88,213,242,.14)', popupStroke: '#020711',
    danger: '#FF6B7A', record: '#FFB347', emptyCard: 'rgba(11,19,48,.6)',
  },
  cheong: {
    // 수궁야행 4조 '청사초롱, 꿈을 담다' 디자인: 별 밤바다 + 옻칠 + 샴페인 골드 자개, 방향 색은 초롱 빛깔
    label: '청사초롱', neon: false, cheong: true, dark: true, frame: true, charGlow: true, padK: 0.062,
    font: '"Gowun Batang","IBM Plex Sans KR","Pretendard","Noto Sans KR","Malgun Gothic",serif',
    dirs: { up: '#FF6A5C', right: '#F7C843', down: '#5FB0F2', left: '#F27AA8' },
    bg: '#0A0E2A', ink: '#FFF1D2', muted: '#CDB892', floor: 'rgba(30,40,96,.66)', line: 'rgba(233,200,140,.3)',
    wall: '#0B0C16', wallShade: '#050508', exit: '#F7C843', exitInk: '#2A1C08', panel: '#07070B', panelTop: '#17151F',
    shadowRGB: '0,0,0', dimRGB: '6,8,24', good: '#F7D27A', track: 'rgba(233,200,140,.16)',
    frozenFill: '#121C46', frozenTrack: 'rgba(95,176,242,.3)', chipBg: 'rgba(247,200,67,.16)', chipInk: '#F7D27A',
    charFill: '#F4F6FF', charLine: '#9FD0FF', charEye: '#1B2140', badgeFill: '#0E0F1C',
    iceFill: '#C9ECFF', startMark: 'rgba(255,241,210,.14)', popupStroke: '#07070B',
    danger: '#FF7A6B', record: '#F7C843', emptyCard: 'rgba(7,7,11,.55)',
  },
};
const C = {};
let themeName = 'classic';
function applyTheme(name) {
  if (!THEMES[name]) name = 'classic';
  themeName = name;
  for (const k of Object.keys(C)) delete C[k]; // 이전 테마에만 있던 값(cheong·frame 등)이 남지 않게
  Object.assign(C, THEMES[name]);
  FONT = C.font;
  for (const d of DIRS) P[d].color = C.dirs[d];
  try { localStorage.setItem('maze-theme', name); } catch (e) {}
  document.documentElement.dataset.theme = name;
  const sel = document.getElementById('themeSel');
  if (sel) sel.value = name;
  bgCache = null; mazeCache = null; frameCache = null;
  if (themeReady) layout();
}
let bgCache = null, mazeCache = null, frameCache = null, themeReady = false;
// 아이템전 아이템: detour = 최단 경로에서 벗어났다 돌아오는 데 드는 추가 칸수(왕복)
const ITEM = {
  star:  { icon: '⭐', color: '#FFC83D', ink: '#B87A00', name: '별',     desc: '기록 -4초',       short: '기록 -4초',  label: '-4초',     detour: 4 },
  glass: { icon: '⏳', color: '#5B9BFF', ink: '#2F6FD6', name: '모래시계', desc: '타이머 2초 정지', short: '타이머 정지', label: '2초 정지', detour: 2 },
  boost: { icon: '🚀', color: '#FF7A45', ink: '#D9541E', name: '로켓',   desc: '출구 쪽 5칸 질주', short: '5칸 질주',  label: '5칸 부스트', detour: 2 },
};
const ITEM_KEYS = ['star', 'glass', 'boost'];
const ITEM_COUNT = [1, 2, 3]; // 쉬움/보통/어려움 스테이지당 아이템 수
const BOOST_STEPS = 5, BOOST_MS = 75; // 부스트: 출구 쪽으로 5칸 자동 질주, 한 칸 75ms
const ITEM_MIN_EXIT = 6;
// 미로 기믹 (스테이지 1/2/3) — 1은 없음, 2는 블랙홀 한 쌍, 3은 블랙홀 한 쌍 + 얼음 한 구간
const HOLE_PAIRS = [0, 1, 1];
const ICE_SEGS = [0, 0, 1];
const ICE_LEN = 3, ICE_MS = 80;     // 얼음 칸 수, 한 칸 미끄러지는 시간
const HOLE_COLORS = ['#8B5CF6', '#14B8A6']; // 아이템으로 갈라지는 지점이 출구에서 최소 이만큼 떨어져 있어야 함
let FONT = THEMES.classic.font;
try { applyTheme(localStorage.getItem('maze-theme') || 'classic'); } catch (e) { applyTheme('classic'); }

// ---------------- 상태 ----------------
const cv = document.getElementById('c');
let ctx = cv.getContext('2d'); // 네온 미로·배경을 미리 그려둘 때 잠깐 다른 캔버스로 바꿔 씀
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
let bestTotal = null;         // 지금 모드의 최고 기록
let mode = 'normal';           // 폰에서 고른 모드 (서버가 알려줌): 'normal' | 'item'
let runMode = 'normal';        // 진행 중인 판의 모드 (시작할 때 고정)
let items = [];                // 아이템전: { x, y, type, dist, taken }
let freezes = [];              // 모래시계 시간 정지 구간 [시작, 끝]
let stageBonus = 0;            // 이번 스테이지에서 별로 줄인 ms
let runItems = { count: 0, saved: 0 };
let botTarget = null;
let seenGimmick = {};          // 이번 판에서 처음 밟을 때만 안내 문구
let holeFx = null;             // 화이트홀에서 튀어나올 때 고리          // 사람이 아이템 쪽으로 가면 도우미도 그 아이템을 목표로
let popups = [];               // 아이템 먹을 때 떠오르는 글자
let newRecord = false;

const cards = {};
for (const d of DIRS) cards[d] = { pulse: 0, shake: 0, wrong: 0 };

const bestKey = m => m === 'item' ? 'maze-best-item' : 'maze-best';
function readBest(m) { try { const b = Number(localStorage.getItem(bestKey(m))); return b > 0 ? b : null; } catch (e) { return null; } }
bestTotal = readBest('normal');

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
  star: () => [880, 1175, 1568].forEach((f, i) => tone(f, 0.12, 'triangle', 0.2, i * 0.06)),
  freeze: () => { tone(1320, 0.3, 'sine', 0.15); tone(990, 0.4, 'sine', 0.12, 0.08); },
  boost: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.07, 'square', 0.06, i * 0.05)),
  hole: () => [880, 660, 440, 300].forEach((f, i) => tone(f, 0.09, 'sine', 0.16, i * 0.05)),
  pop: () => [330, 523, 784].forEach((f, i) => tone(f, 0.08, 'triangle', 0.18, i * 0.04)),
  slide: () => { tone(1500, 0.28, 'sine', 0.06); tone(1900, 0.22, 'sine', 0.04, 0.06); },
  poke: () => { tone(1200, 0.05, 'square', 0.06); tone(1500, 0.05, 'square', 0.06, 0.07); },
  dash: i => tone(500 + i * 90, 0.05, 'triangle', 0.12),
  win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.2, i * 0.11)),
};
addEventListener('pointerdown', audio);

// ---------------- 미로 ----------------
const lastPick = {}; // 난이도별 직전 맵 번호
function loadStage(i) {
  stageIdx = i;
  const pool = STAGES[i].maps;
  let k = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && k === lastPick[i]) k = (k + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
  lastPick[i] = k;
  const map = pool[k];
  // 갈래길을 무작위로 뚫다 보면 아이템 둘 자리가 모자랄 때가 있어서, 그럴 땐 몇 번 다시 뚫어 봄
  for (let attempt = 0; attempt < 8; attempt++) {
    const grid = map.map(r => [...r]);
    let start, exit;
    grid.forEach((row, y) => row.forEach((c, x) => {
      if (c === 'S') start = { x, y };
      if (c === 'E') exit = { x, y };
    }));
    maze = { grid, cols: grid[0].length, rows: grid.length, start, exit };
    addLoops();
    placeHoles();
    placeIce();
    maze.dist = distTo(exit); // 출구까지 거리표 (도우미 봇 길찾기용, 블랙홀 반영)
    placeItems();
    const itemsOk = runMode !== 'item' || items.length >= (ITEM_COUNT[i] || 1);
    const holesOk = maze.holes.length >= (HOLE_PAIRS[i] || 0);
    if (itemsOk && holesOk) break;
  }
  botPlan = null; waitHuman = null; lastBotDir = null;
  char.x = char.fx = maze.start.x; char.y = char.fy = maze.start.y;
  char.t0 = 0; char.bump = null; char.face = 'right'; char.boost = null; char.dur = MOVE_MS; char.hole = null; char.pop = 0;
  holeFx = null;
  queue = []; trail = []; popups = [];
  freezes = []; stageBonus = 0;
}
// 갈래길 만들기: 통로 사이 벽을 무작위로 뚫어 출구까지 가는 길을 여러 개로 (판마다 다름)
// - 벽 양쪽이 원래 LOOP_MIN칸 이상 돌아가야 이어지던 곳만 뚫음 → 의미 있는 '다른 길'이 생김
// - 최단 거리가 원래보다 LOOP_KEEP 미만으로 짧아지면 되돌림 → 난이도 유지
const LOOPS = [3, 5, 8];
const LOOP_MIN = 6, LOOP_KEEP = 0.8;
function addLoops() {
  const g = maze.grid;
  const len = () => bfs(maze.start)[maze.exit.y][maze.exit.x];
  const base = len();
  const open = (x, y) => g[y][x] !== '#';
  const walls = [];
  for (let y = 1; y < maze.rows - 1; y++) for (let x = 1; x < maze.cols - 1; x++) {
    if (g[y][x] !== '#') continue;
    // 좌우로 통로, 위아래는 벽 (또는 그 반대) — 넓은 빈 공간이 생기지 않게
    if (open(x - 1, y) && open(x + 1, y) && !open(x, y - 1) && !open(x, y + 1)) walls.push({ x, y, a: { x: x - 1, y }, b: { x: x + 1, y } });
    else if (open(x, y - 1) && open(x, y + 1) && !open(x - 1, y) && !open(x + 1, y)) walls.push({ x, y, a: { x, y: y - 1 }, b: { x, y: y + 1 } });
  }
  walls.sort(() => Math.random() - 0.5);
  let made = 0;
  for (const w of walls) {
    if (made >= (LOOPS[stageIdx] ?? 3)) break;
    if (bfs(w.a)[w.b.y][w.b.x] < LOOP_MIN) continue;
    g[w.y][w.x] = '.';
    if (len() < base * LOOP_KEEP) { g[w.y][w.x] = '#'; continue; }
    made++;
  }
  maze.loops = made;
}
// ---------------- 미로 기믹 ----------------
const cellKey = (x, y) => x + ',' + y;
function holeAt(x, y) { return (maze.holes || []).find(h => h.b.x === x && h.b.y === y) || null; }
function isHoleCell(x, y) { return (maze.holes || []).some(h => (h.b.x === x && h.b.y === y) || (h.w.x === x && h.w.y === y)); }
function isIce(x, y) { return !!maze.ice && maze.ice.has(cellKey(x, y)); }
// 그 칸에 들어가면 실제로 서게 되는 곳 (블랙홀이면 짝 화이트홀)
function landAt(x, y) { const h = holeAt(x, y); return h ? h.w : { x, y }; }
// 출발점에서 각 칸까지 (블랙홀 반영)
function distFrom(from) {
  const dist = maze.grid.map(r => r.map(() => Infinity));
  dist[from.y][from.x] = 0;
  const q = [from];
  while (q.length) {
    const c = q.shift();
    for (const d of DIRS) {
      const nx = c.x + P[d].dx, ny = c.y + P[d].dy;
      if (isWall(nx, ny)) continue;
      const l = landAt(nx, ny);
      if (dist[l.y][l.x] === Infinity) { dist[l.y][l.x] = dist[c.y][c.x] + 1; q.push(l); }
    }
  }
  return dist;
}
// 각 칸에서 목표까지 (블랙홀 반영, 거꾸로 탐색). 블랙홀 칸 자체는 설 수 없어서 Infinity
function distTo(target) {
  const dist = maze.grid.map(r => r.map(() => Infinity));
  dist[target.y][target.x] = 0;
  const q = [target];
  while (q.length) {
    const c = q.shift(), v = dist[c.y][c.x];
    const addAround = (cx, cy) => {
      for (const d of DIRS) {
        const nx = cx + P[d].dx, ny = cy + P[d].dy;
        if (isWall(nx, ny) || holeAt(nx, ny)) continue;
        if (dist[ny][nx] === Infinity) { dist[ny][nx] = v + 1; q.push({ x: nx, y: ny }); }
      }
    };
    addAround(c.x, c.y);
    for (const h of maze.holes || []) if (h.w.x === c.x && h.w.y === c.y) addAround(h.b.x, h.b.y);
  }
  return dist;
}
// 블랙홀을 넣어도 출구까지 가는 데 문제가 없는지 (어디서든 출구로 갈 수 있어야 함)
function holesSafe() {
  const dS = distFrom(maze.start), dE = distTo(maze.exit);
  if (dS[maze.exit.y][maze.exit.x] === Infinity) return false;
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
    if (dS[y][x] !== Infinity && dE[y][x] === Infinity) return false;
  }
  return true;
}
// 블랙홀→화이트홀 (한쪽 방향) — Codex와 상의한 배치 규칙
// - 블랙홀 B: 출구 가는 길(최단 경로)에서 다른 방향으로 2~3칸 들어간 갈래에. 길 위엔 절대 안 둠 → '탈까 말까' 선택
// - 화이트홀 W: 그 갈림길 J보다 출구 쪽으로 5~8칸 앞, 길 위에 (타면 앞쪽 길로 합류)
// - 순간이동 거리(화면상 칸 거리)는 2~5칸 (큰 맵은 6칸까지) → 짧은 점프
// - 순이득(갈림길에서 출발해 블랙홀 타는 게 몇 칸 빠른지)은 2~4칸 → 고민되지만 대체로 이득, 손해 함정은 없음
// - 후보가 없으면 조건을 단계적으로 완화, 그래도 없으면 그 판은 블랙홀 없이
const HOLE_RULES = [ // [W 앞쪽 최소, 최대, B 갈래 깊이 최소, 최대, 순이득 최소, 최대]
  [5, 8, 2, 3, 2, 4],
  [4, 9, 2, 3, 2, 4],
  [4, 9, 1, 3, 2, 4],
  [4, 9, 1, 3, 1, 5],
];
function placeHoles() {
  maze.holes = [];
  const n = HOLE_PAIRS[stageIdx] || 0;
  const maxJump = maze.cols >= 21 ? 6 : 5;
  for (let p = 0; p < n; p++) {
    const dS = distFrom(maze.start), dE = distTo(maze.exit), base = dS[maze.exit.y][maze.exit.x];
    const onPath = (x, y) => dS[y][x] + dE[y][x] === base;
    const marks = [maze.start, maze.exit, ...maze.holes.flatMap(h => [h.b, h.w])];
    const near = (c, r) => marks.some(o => Math.abs(o.x - c.x) + Math.abs(o.y - c.y) < r);
    // 길 밖 칸마다: 어느 갈림길(J)에서 몇 칸 들어갔는지 (길 위 칸 전체에서 동시에 퍼져 나감)
    const depth = maze.grid.map(r => r.map(() => Infinity)), root = maze.grid.map(r => r.map(() => null));
    const q = [];
    for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
      if (!isWall(x, y) && !holeAt(x, y) && dS[y][x] !== Infinity && onPath(x, y)) { depth[y][x] = 0; root[y][x] = { x, y }; q.push({ x, y }); }
    }
    while (q.length) {
      const c = q.shift();
      for (const d of DIRS) {
        const nx = c.x + P[d].dx, ny = c.y + P[d].dy;
        if (isWall(nx, ny) || isHoleCell(nx, ny) || depth[ny][nx] !== Infinity) continue;
        depth[ny][nx] = depth[c.y][c.x] + 1; root[ny][nx] = root[c.y][c.x]; q.push({ x: nx, y: ny });
      }
    }
    const pathCells = [];
    for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) if (depth[y][x] === 0) pathCells.push({ x, y });

    let placed = false;
    for (const [fMin, fMax, dMin, dMax, gMin, gMax] of HOLE_RULES) {
      const pairs = [];
      for (let y = 0; y < maze.rows && !placed; y++) for (let x = 0; x < maze.cols; x++) {
        const dp = depth[y][x];
        if (dp < dMin || dp > dMax || dE[y][x] === Infinity || near({ x, y }, 3)) continue;
        const J = root[y][x];
        if (dS[J.y][J.x] < 4) continue;
        for (const w of pathCells) {
          const fwd = dS[w.y][w.x] - dS[J.y][J.x];
          if (fwd < fMin || fwd > fMax || dE[w.y][w.x] < 5 || near(w, 2)) continue;
          const jump = Math.abs(x - w.x) + Math.abs(y - w.y);
          if (jump < 2 || jump > maxJump) continue;
          const gain = fwd - dp; // 갈림길에서: 본길로 fwd칸 vs 갈래 dp칸 + 순간이동
          if (gain < gMin || gain > gMax) continue;
          pairs.push({ b: { x, y }, w: { x: w.x, y: w.y }, J, gain });
        }
      }
      pairs.sort(() => Math.random() - 0.5);
      for (const pr of pairs.slice(0, 80)) {
        maze.holes.push({ b: pr.b, w: pr.w, color: HOLE_COLORS[p % HOLE_COLORS.length] });
        // 실제 거리로 검증: 갈림길에서 출구까지가 정말 gMin~gMax칸 줄었는지 (다른 갈래길 지름길까지 반영)
        const real = dE[pr.J.y][pr.J.x] - distTo(maze.exit)[pr.J.y][pr.J.x];
        if (holesSafe() && real >= gMin && real <= gMax) { placed = true; break; }
        maze.holes.pop();
      }
      if (placed) break;
    }
  }
}
// 얼음: 양옆이 벽인 곧은 통로에 ICE_LEN칸. 들어가면 반대편 끝까지 미끄러짐 (출구 가는 길 위 우선)
function placeIce() {
  maze.ice = new Set();
  const n = ICE_SEGS[stageIdx] || 0;
  if (!n) return;
  const dS = distFrom(maze.start), dE = distTo(maze.exit), base = dS[maze.exit.y][maze.exit.x];
  const special = (x, y) => isHoleCell(x, y) || (x === maze.start.x && y === maze.start.y) || (x === maze.exit.x && y === maze.exit.y);
  const segs = [];
  for (let y = 1; y < maze.rows - 1; y++) for (let x = 1; x < maze.cols - 1; x++) {
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const cells = [];
      let ok = true;
      for (let i = 0; i < ICE_LEN && ok; i++) {
        const cx = x + dx * i, cy = y + dy * i;
        const side = dx ? isWall(cx, cy - 1) && isWall(cx, cy + 1) : isWall(cx - 1, cy) && isWall(cx + 1, cy);
        if (isWall(cx, cy) || !side || special(cx, cy) || dS[cy][cx] === Infinity) ok = false;
        cells.push({ x: cx, y: cy });
      }
      // 얼음 앞뒤는 평범한 바닥 (멈추는 칸)
      const bx = x - dx, by = y - dy, ax = x + dx * ICE_LEN, ay = y + dy * ICE_LEN;
      if (!ok || isWall(bx, by) || isWall(ax, ay) || holeAt(bx, by) || holeAt(ax, ay)) continue;
      const onPath = cells.every(c => dS[c.y][c.x] + dE[c.y][c.x] === base);
      segs.push({ cells, onPath });
    }
  }
  const pathSegs = segs.filter(sg => sg.onPath);
  const pool = pathSegs.length ? pathSegs : segs;
  for (let i = 0; i < n && pool.length; i++) {
    const sg = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (sg.cells.some(c => isIce(c.x, c.y))) { i--; continue; }
    for (const c of sg.cells) maze.ice.add(cellKey(c.x, c.y));
  }
}
// 한 칸에서 모든 칸까지의 거리표 (기믹 무시 — 갈래길 만들 때용)
function bfs(from) {
  const grid = maze.grid;
  const dist = grid.map(r => r.map(() => Infinity));
  dist[from.y][from.x] = 0;
  const q = [from];
  while (q.length) {
    const c = q.shift();
    for (const d of DIRS) {
      const nx = c.x + P[d].dx, ny = c.y + P[d].dy;
      if (grid[ny] && grid[ny][nx] && grid[ny][nx] !== '#' && dist[ny][nx] === Infinity) {
        dist[ny][nx] = dist[c.y][c.x] + 1; q.push({ x: nx, y: ny });
      }
    }
  }
  return dist;
}
const pickOne = a => a[Math.floor(Math.random() * a.length)];
// 아이템전: 최단 경로에서 살짝 벗어난 곳(막다른 길 우선)에 아이템 자동 배치
// 우회 칸수 = (출발→아이템) + (아이템→출구) − (출발→출구). 별은 4칸, 모래시계·부스트는 2칸 우회 자리에.
function placeItems() {
  items = []; botTarget = null;
  if (runMode !== 'item') return;
  const dS = distFrom(maze.start), dE = maze.dist, base = dE[maze.start.y][maze.start.x];
  const cells = [];
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
    if (maze.grid[y][x] === '#' || dS[y][x] < 3 || dE[y][x] === 0 || dS[y][x] === Infinity || dE[y][x] === Infinity) continue;
    if (isHoleCell(x, y) || isIce(x, y)) continue;
    if ((maze.holes || []).some(h => Math.abs(h.b.x - x) + Math.abs(h.b.y - y) < 3)) continue; // 블랙홀 갈래와 겹치지 않게
    let open = 0;
    for (const d of DIRS) if (!isWall(x + P[d].dx, y + P[d].dy)) open++;
    const detour = dS[y][x] + dE[y][x] - base;
    // junc = 갈림길(최단 경로에서 아이템 쪽으로 꺾는 칸)에서 출구까지 거리 — 출구 바로 옆 아이템은 고민거리가 안 됨
    const junc = dE[y][x] - detour / 2;
    if (detour === 0 || junc < 3) continue;
    cells.push({ x, y, detour, junc, dead: open === 1 });
  }
  const types = ['star', 'glass', 'boost'].sort(() => Math.random() - 0.5).slice(0, ITEM_COUNT[stageIdx] || 1);
  for (const type of types) {
    const want = ITEM[type].detour;
    let cand = null;
    // 조건을 단계적으로 완화: [출구까지 최소 거리, 우회 최소, 우회 최대, 아이템끼리 최소 거리]
    for (const [mj, lo, hi, gap] of [[ITEM_MIN_EXIT, want, want, 4], [ITEM_MIN_EXIT, want, want + 2, 4], [ITEM_MIN_EXIT, 2, 8, 4], [4, 2, 10, 3], [3, 2, 12, 2]]) {
      const cs = cells.filter(c => c.junc >= mj && c.detour >= lo && c.detour <= hi && items.every(it => it.dist[c.y][c.x] >= gap));
      if (cs.length) { const dead = cs.filter(c => c.dead); cand = pickOne(dead.length ? dead : cs); break; }
    }
    if (cand) items.push({ x: cand.x, y: cand.y, type, dist: distTo(cand), taken: false });
  }
}
// 모래시계로 멈춘 시간, 스테이지 기록(정지·별 반영)
function frozenMs(t) { let s = 0; for (const [a, b] of freezes) s += Math.max(0, Math.min(t, b) - a); return s; }
const isFrozen = t => freezes.some(([a, b]) => t >= a && t < b);
function stageElapsed(t) { return Math.max(0, t - stageStart - frozenMs(t) - stageBonus); }
// ---------------- 도우미 봇 ----------------
// 빈 자리(참가자 없는 방향)는 봇이 맡음. 출구까지 최단 경로의 다음 방향이
// 봇 담당이면 잠깐 뒤 대신 1칸 이동, 사람 담당이면 그 사람을 기다림.
let botPlan = null;    // { dir, at }
let waitHuman = null; // { dir, since }
let lastBotDir = null;
const isBot = d => !slots[d];
const hasBots = () => DIRS.some(isBot);

function stepToward(dist, x, y) {
  const d0 = dist[y][x];
  for (const d of DIRS) {
    const nx = x + P[d].dx, ny = y + P[d].dy;
    if (isWall(nx, ny)) continue;
    const l = landAt(nx, ny);
    if (dist[l.y][l.x] === d0 - 1) return d;
  }
  return null;
}
function nextDir() {
  return stepToward(botTarget ? botTarget.dist : maze.dist, char.x, char.y);
}
// 아이템전: 사람이 출구에서 멀어지면서 어떤 아이템 쪽으로 다가가면 도우미도 그 아이템으로.
// 사람이 다시 아이템에서 멀어지면 출구로 복귀.
function followHuman(slot, fx, fy) {
  if (runMode !== 'item' || isBot(slot)) return;
  const x = char.x, y = char.y;
  if (botTarget) {
    if (botTarget.dist[y][x] > botTarget.dist[fy][fx]) botTarget = null;
    return;
  }
  if (maze.dist[y][x] <= maze.dist[fy][fx]) return;
  let best = null;
  for (const it of items) {
    if (!it.taken && it.dist[y][x] < it.dist[fy][fx] && (!best || it.dist[y][x] < best.dist[y][x])) best = it;
  }
  botTarget = best;
}

function updateBots(t) {
  const idle = !queue.length && (!char.t0 || t - char.t0 >= (char.dur || MOVE_MS)) && !char.bump && !char.boost && !char.hole;
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
  runMode = mode;
  seenGimmick = {};
  bestTotal = readBest(runMode);
  runItems = { count: 0, saved: 0 };
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
    try { localStorage.setItem(bestKey(runMode), String(total)); } catch (e) {}
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
  // 얼음: 얼음이 끝날 때까지(또는 벽 앞까지) 쭉 미끄러짐
  let ex = nx, ey = ny, slid = 0;
  while (isIce(ex, ey) && !isWall(ex + p.dx, ey + p.dy)) {
    trail.push({ x: ex, y: ey, color: '#7DD3FC' });
    ex += p.dx; ey += p.dy; slid++;
  }
  char.fx = char.x; char.fy = char.y;
  char.x = ex; char.y = ey;
  char.t0 = now(); char.by = slot; char.dur = slid ? MOVE_MS + slid * ICE_MS : MOVE_MS;
  trail.push({ x: char.fx, y: char.fy, color: p.color });
  while (trail.length > 80) trail.shift();
  stats[slot].moves++;
  sfx.move(slot);
  if (slid) {
    sfx.slide();
    if (!seenGimmick.ice) { seenGimmick.ice = 1; popup(ex, ey, '🧊 쭈욱~', '#38BDF8'); }
  }
  // 블랙홀: 빨려 들어간 뒤 화이트홀로 튀어나옴
  const h = holeAt(ex, ey);
  if (h) {
    char.hole = { h, slot, from: { x: char.fx, y: char.fy }, t0: now(), at: now() + char.dur + 260 };
    queue = [];
    sfx.hole();
    if (!seenGimmick.hole) { seenGimmick.hole = 1; popup(ex, ey, '🕳 블랙홀 → ⚪ 화이트홀!', h.color); }
    return;
  }
  followHuman(slot, char.fx, char.fy);
  if (!checkExit()) pickItem(ex, ey);
}

function exitHole(t) {
  const { h, slot, from } = char.hole;
  char.hole = null;
  char.x = char.fx = h.w.x; char.y = char.fy = h.w.y;
  char.t0 = 0; char.dur = MOVE_MS; char.pop = t;
  holeFx = { x: h.w.x, y: h.w.y, t0: t, color: h.color };
  queue = []; // 빨려 들어가는 동안 쌓인 입력은 버림
  sfx.pop();
  if (slot) followHuman(slot, from.x, from.y);
  if (!checkExit()) pickItem(h.w.x, h.w.y);
}

function checkExit() {
  if (char.x !== maze.exit.x || char.y !== maze.exit.y) return false;
  const t = now();
  const rec = stageElapsed(t);
  runItems.saved += (t - stageStart) - rec;
  stageTimes.push(rec);
  queue = [];
  setTimeout(() => { sfx.clear(); burst(40); }, MOVE_MS);
  setState('clear');
  return true;
}

let itemToast = null, legendFlash = {}, itemRings = [];
function popup(x, y, str, color) { popups.push({ x, y, str, color, t0: now() }); }

function pickItem(x, y) {
  const it = items.find(i => !i.taken && i.x === x && i.y === y);
  if (!it) return;
  it.taken = true;
  runItems.count++;
  if (botTarget === it) botTarget = null;
  const t = now(), I = ITEM[it.type];
  itemToast = { type: it.type, t0: t };
  legendFlash[it.type] = t;
  itemRings.push({ x, y, color: I.color, t0: t });
  if (it.type === 'star') {
    stageBonus += 4000;
    sfx.star();
  } else if (it.type === 'glass') {
    const last = freezes[freezes.length - 1];
    if (last && t < last[1]) last[1] += 2000; else freezes.push([t, t + 2000]);
    sfx.freeze();
  } else {
    // 부스트: 아이템 칸 도착 직후부터 출구 쪽 최단 경로를 따라 5칸 자동 질주 (눈에 보이게 한 칸씩)
    sfx.boost();
    char.boost = { left: BOOST_STEPS, next: t + MOVE_MS + 60, i: 0 };
  }
}

function boostStep(t) {
  const b = char.boost;
  const d = stepToward(maze.dist, char.x, char.y);
  if (!d) { char.boost = null; return; }
  char.fx = char.x; char.fy = char.y;
  char.x += P[d].dx; char.y += P[d].dy;
  char.face = d; char.by = null; char.t0 = t; char.dur = BOOST_MS;
  const bh = holeAt(char.x, char.y);
  if (bh) {
    char.x = char.fx = bh.w.x; char.y = char.fy = bh.w.y; char.t0 = 0; char.pop = t;
    holeFx = { x: bh.w.x, y: bh.w.y, t0: t, color: bh.color }; sfx.pop();
  }
  trail.push({ x: char.fx, y: char.fy, color: ITEM.boost.color });
  if (trail.length > 80) trail.shift();
  sfx.dash(b.i++);
  b.left--;
  if (checkExit()) { char.boost = null; return; }
  if (b.left <= 0) { char.boost = null; queue = []; } // 질주 중 쌓인 입력은 버림
  else b.next = t + BOOST_MS;
}

// 서버 이벤트
let themeSynced = false;
// 게임 화면에서 테마 바꾸기 (⚙ 설정 또는 T키) → 서버를 거쳐 폰들도 같이 바뀜
function setTheme(name) {
  applyTheme(name);
  post('/theme', { theme: themeName });
}
function connect() {
  const es = new EventSource('/events');
  es.onopen = () => {
    connected = true; post('/phase', { phase: state }); loadInfo(); // 서버를 다시 켜면 터널 주소가 바뀌므로 QR도 새로
    // 서버가 새로 켜졌을 수 있으니 이 화면의 테마를 먼저 알려 주고, 그 뒤부터 서버(폰에서 바꾼 테마)를 따름
    themeSynced = false;
    post('/theme', { theme: themeName }).then(() => { themeSynced = true; });
  };
  es.onerror = () => { connected = false; themeSynced = false; };
  es.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.t === 'slots') {
      const before = joinedCount();
      for (const d of DIRS) if (!slots[d] && m.slots[d]) { cards[d].pulse = 1; sfx.join(); }
      slots = m.slots;
      if (m.mode && m.mode !== mode) { mode = m.mode; lastActivity = now(); }
      if (themeSynced && m.theme && m.theme !== themeName) applyTheme(m.theme);
      if (joinedCount() !== before) lastActivity = now();
    } else if (m.t === 'swipe') {
      handleSwipe(m.slot, m.dir);
    } else if (m.t === 'poke') {
      if (cards[m.to] && P[m.from]) { cards[m.to].poked = 1; cards[m.to].pokeFrom = m.from; cards[m.to].shake = 1; cards[m.from].pulse = 1; sfx.poke(); lastActivity = now(); }
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
    if (state === 'play') { stageTimes.push(stageElapsed(now())); setState('clear'); }
  } else if (k === 'm' || k === 'M') {
    if (state === 'lobby' || state === 'result') post('/mode', { mode: mode === 'item' ? 'normal' : 'item' });
  } else if (k === 't' || k === 'T') {
    const names = Object.keys(THEMES);
    setTheme(names[(names.indexOf(themeName) + 1) % names.length]);
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
document.getElementById('themeSel').value = themeName;
document.getElementById('themeSel').onchange = e => setTheme(e.target.value);
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
  const pad = u * (C.padK || 0.025); // 청사초롱은 화면 테두리(네임택) 안쪽으로
  const tbW = clamp(u * 0.34, 180, 520), tbH = clamp(u * 0.085, 48, 120);
  const sW = clamp(u * 0.13, 80, 200), sH = clamp(u * 0.22, 120, 300);
  L = { u, pad, tbW, tbH, sW, sH };
  const side = pad * 2 + sW;
  // 아이템전 범례 자리 (왼쪽 아래)
  {
    const w = clamp(u * 0.3, 210, 470), ip = u * 0.022, rowH = u * 0.062, headH = u * 0.05;
    const h = headH + rowH * ITEM_KEYS.length + ip * 0.8;
    L.leg = { x: pad, y: H - pad - h, w, h, ip, rowH, headH };
  }
  L.card = {
    up:    { x: W / 2 - tbW / 2, y: pad, w: tbW, h: tbH, vertical: false },
    down:  { x: W / 2 - tbW / 2, y: H - pad - tbH, w: tbW, h: tbH, vertical: false },
    left:  { x: pad, y: H / 2 - sH / 2, w: sW, h: sH, vertical: true },
    right: { x: W - pad - sW, y: H / 2 - sH / 2, w: sW, h: sH, vertical: true },
  };
  L.area = { x: side, y: pad * 2 + tbH, w: W - side * 2, h: H - (pad * 2 + tbH) * 2 };
}
addEventListener('resize', layout);

function mazeGeom() {
  const a = L.area;
  let cs = Math.floor(Math.min(a.w / maze.cols, a.h / maze.rows));
  let mw = cs * maze.cols, mh = cs * maze.rows;
  let ox = a.x + (a.w - mw) / 2, oy = a.y + (a.h - mh) / 2;
  // 아이템전: 왼쪽 아래 범례와 겹치면 미로를 위로 올리고, 그래도 겹치면 한 칸씩 줄이기
  if (runMode === 'item' && state !== 'lobby' && state !== 'result') {
    const lg = L.leg, gap = L.pad * 0.6;
    while (cs > 6) {
      mw = cs * maze.cols; mh = cs * maze.rows;
      ox = a.x + (a.w - mw) / 2;
      oy = Math.max(a.y, Math.min(a.y + (a.h - mh) / 2, lg.y - gap - mh));
      if (ox >= lg.x + lg.w + gap || oy + mh <= lg.y - gap) break;
      cs--;
    }
  }
  return { cs, ox: Math.round(ox), oy: Math.round(oy), mw, mh };
}

// ---------------- 그리기 ----------------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(str, x, y, size, color, weight = 700, align = 'center', base = 'middle') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(str, x, y);
}

// 화면 크기 캔버스를 하나 만들어 draw()로 그려 둠 (그리는 동안만 ctx를 바꿔치기)
function offscreen(draw) {
  const c = document.createElement('canvas');
  c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
  const main = ctx;
  ctx = c.getContext('2d'); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  try { draw(); } finally { ctx = main; }
  return c;
}

// 네온 미로: 어두운 벽 + 길과 맞닿은 벽 가장자리를 하늘색→보라 네온선으로
function neonMazeLayer(cs, ox, oy, mw, mh) {
  const k = cs * 0.6;
  ctx.save();
  ctx.shadowColor = 'rgba(88,213,242,.25)'; ctx.shadowBlur = cs * 1.2;
  shape(ox, oy, mw, mh, k); ctx.fillStyle = C.wall; ctx.fill();
  ctx.restore();
  ctx.save();
  shape(ox, oy, mw, mh, k); ctx.clip();
  const isWall = (x, y) => y < 0 || y >= maze.rows || x < 0 || x >= maze.cols || maze.grid[y][x] === '#';
  // 길(바닥) + 칸마다 작은 점
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
    if (isWall(x, y)) continue;
    ctx.fillStyle = C.floor; ctx.fillRect(ox + x * cs, oy + y * cs, cs + 0.5, cs + 0.5);
    ctx.fillStyle = 'rgba(127,140,255,.18)';
    ctx.fillRect(ox + (x + 0.5) * cs - 1, oy + (y + 0.5) * cs - 1, 2, 2);
  }
  // 벽 안쪽 무늬: 가는 대각선
  ctx.strokeStyle = 'rgba(127,140,255,.07)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
    if (!isWall(x, y)) continue;
    const px = ox + x * cs, py = oy + y * cs;
    ctx.moveTo(px, py + cs * 0.5); ctx.lineTo(px + cs * 0.5, py);
    ctx.moveTo(px + cs * 0.5, py + cs); ctx.lineTo(px + cs, py + cs * 0.5);
  }
  ctx.stroke();
  // 네온 가장자리
  ctx.beginPath();
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
    if (!isWall(x, y)) continue;
    const px = ox + x * cs, py = oy + y * cs;
    if (!isWall(x, y - 1)) { ctx.moveTo(px, py); ctx.lineTo(px + cs, py); }
    if (!isWall(x, y + 1)) { ctx.moveTo(px, py + cs); ctx.lineTo(px + cs, py + cs); }
    if (!isWall(x - 1, y)) { ctx.moveTo(px, py); ctx.lineTo(px, py + cs); }
    if (!isWall(x + 1, y)) { ctx.moveTo(px + cs, py); ctx.lineTo(px + cs, py + cs); }
  }
  const g = ctx.createLinearGradient(ox, oy, ox + mw, oy + mh);
  g.addColorStop(0, C.edgeA); g.addColorStop(1, C.edgeB);
  ctx.strokeStyle = g; ctx.lineCap = 'square';
  ctx.shadowColor = C.edgeA; ctx.shadowBlur = cs * 0.3;
  ctx.lineWidth = Math.max(1.5, cs * 0.05); ctx.stroke();
  ctx.shadowBlur = 0; ctx.globalAlpha = 0.9; ctx.lineWidth = Math.max(1, cs * 0.025); ctx.strokeStyle = '#DDF6FF'; ctx.stroke();
  ctx.restore();
  // 바깥 테두리
  shape(ox, oy, mw, mh, k); neonStroke(ox, oy, mw, mh, C.edgeA, C.edgeB, Math.max(2, cs * 0.06));
}

// 네온 배경: 남색 그라데이션 + 화면 모서리 쪽 회로선 (고정) + 회로를 따라 흐르는 빛 (매 프레임)
function rand(seed) { return () => (seed = seed * 16807 % 2147483647) / 2147483647; }
function buildCircuit() {
  const R = rand(20261116), u = L.u, traces = [];
  for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]]) {
    for (let i = 0; i < 6; i++) { // 위·아래 가장자리에서 들어오는 선
      const x0 = cx + sx * (u * 0.05 + i * u * 0.03 + R() * u * 0.008);
      const a = u * (0.03 + R() * 0.12), d = u * (0.015 + R() * 0.05), b = u * (0.03 + R() * 0.12);
      traces.push({ w: R() < 0.3 ? 2 : 1, pts: [[x0, cy - sy * 4], [x0, cy + sy * a], [x0 + sx * d, cy + sy * (a + d)], [x0 + sx * d, cy + sy * (a + d + b)]] });
    }
    for (let i = 0; i < 5; i++) { // 옆 가장자리에서 들어오는 선
      const y0 = cy + sy * (u * 0.2 + i * u * 0.028 + R() * u * 0.006);
      const a = u * (0.02 + R() * 0.08), d = u * (0.015 + R() * 0.04), b = u * (0.02 + R() * 0.08);
      traces.push({ w: R() < 0.3 ? 2 : 1, pts: [[cx - sx * 4, y0], [cx + sx * a, y0], [cx + sx * (a + d), y0 + sy * d], [cx + sx * (a + d + b), y0 + sy * d]] });
    }
  }
  for (const tr of traces) {
    tr.segs = []; tr.len = 0;
    for (let i = 1; i < tr.pts.length; i++) {
      const [x1, y1] = tr.pts[i - 1], [x2, y2] = tr.pts[i], l = Math.hypot(x2 - x1, y2 - y1);
      tr.segs.push({ x1, y1, x2, y2, l, at: tr.len }); tr.len += l;
    }
  }
  return traces;
}
function tracePoint(tr, d) {
  for (const sg of tr.segs) if (d <= sg.at + sg.l) { const k = (d - sg.at) / sg.l; return [sg.x1 + (sg.x2 - sg.x1) * k, sg.y1 + (sg.y2 - sg.y1) * k]; }
  const e = tr.segs[tr.segs.length - 1]; return [e.x2, e.y2];
}
let pulses = [];
function drawBackground(t) {
  if (C.cheong) return cheongBackground(t);
  if (!C.neon) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); return; }
  const key = `${W}x${H}|${DPR}`;
  if (!bgCache || bgCache.key !== key) {
    const traces = buildCircuit();
    bgCache = { key, traces, cv: offscreen(() => {
      const g = ctx.createRadialGradient(W / 2, -H * 0.1, 0, W / 2, -H * 0.1, Math.max(W, H) * 1.05);
      g.addColorStop(0, C.bgTop); g.addColorStop(0.55, '#06101F'); g.addColorStop(1, C.bg);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const lg = ctx.createLinearGradient(0, 0, 0, H);
      lg.addColorStop(0, '#3F5BFF'); lg.addColorStop(0.5, '#5546FF'); lg.addColorStop(1, '#8B45FF');
      ctx.globalAlpha = 0.55; ctx.strokeStyle = lg; ctx.fillStyle = lg; ctx.lineJoin = 'round';
      for (const tr of traces) {
        ctx.lineWidth = tr.w * Math.max(1, L.u * 0.0012);
        ctx.beginPath(); tr.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        const [ex, ey] = tr.pts[tr.pts.length - 1], r = L.u * (tr.w > 1 ? 0.006 : 0.004);
        ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2);
        if (tr.w > 1) { ctx.globalAlpha = 0.8; ctx.strokeStyle = '#DDE6FF'; ctx.stroke(); ctx.strokeStyle = lg; ctx.globalAlpha = 0.55; }
        else ctx.fill();
      }
      ctx.globalAlpha = 1;
    }) };
    pulses = [];
  }
  ctx.drawImage(bgCache.cv, 0, 0, W, H);
  // 흐르는 빛
  const tr = bgCache.traces;
  while (pulses.length < 6) pulses.push({ tr: tr[Math.floor(Math.random() * tr.length)], t0: t + Math.random() * 1500, sp: L.u * (0.12 + Math.random() * 0.1) / 1000 });
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of pulses) {
    const d = (t - p.t0) * p.sp;
    if (d < 0) continue;
    if (d > p.tr.len) { p.done = true; continue; }
    const fade = Math.min(1, d / (L.u * 0.03), (p.tr.len - d) / (L.u * 0.03));
    for (let i = 0; i < 6; i++) { // 꼬리
      const [x, y] = tracePoint(p.tr, Math.max(0, d - i * L.u * 0.006));
      ctx.globalAlpha = fade * (1 - i / 6) * 0.9;
      ctx.fillStyle = i ? '#7F8CFF' : '#E8F4FF';
      ctx.beginPath(); ctx.arc(x, y, L.u * (i ? 0.0035 : 0.0045), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  pulses = pulses.filter(p => !p.done);
}

// ---------------- 청사초롱 테마 (수궁야행 4조 작품 디자인) ----------------
// 별 밤바다 배경 + 옻칠 검정 바탕 + 샴페인 골드 자개 테두리. 네임택(꼬리표)의 자개 테두리·回자 귀퉁이 무늬를 화면 테두리로 씀
const cheongBg = new Image();
cheongBg.onload = () => { bgCache = null; };
cheongBg.src = 'themes/cheong/bg.jpg';

// 자개 빛 (네임택과 같은 색 띠)
function nacre(x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  [['#E8C98A', 0], ['#FFF4DA', .16], ['#D9AE68', .32], ['#F6DCC6', .48], ['#FFFBEF', .62], ['#E2BC7C', .78], ['#F3D6B8', .9], ['#FFF6E2', 1]].forEach(([c, o]) => g.addColorStop(o, c));
  return g;
}
// 현재 경로에 자개 금빛 테두리
function goldStroke(x, y, w, h, lw = 0) {
  ctx.save();
  ctx.shadowColor = 'rgba(240,200,130,.55)'; ctx.shadowBlur = L.u * 0.008;
  ctx.strokeStyle = nacre(x, y, x + w, y + h); ctx.lineWidth = lw || Math.max(1.5, L.u * 0.0022); ctx.stroke();
  ctx.restore();
}

// 네임택 귀퉁이 回자 창살 무늬 (원본 작품의 FRET 그대로, 세로 팔은 원본처럼 2/3에서 자름)
const FRET = ["##############...##############..#########..###", "##############...##############..#########..###", "##############...##############..#########..###", "###........###...###........###..###...###..###", "###........###...###........###..###...###..###", "###........###...###........###..###...###..###", "###..####################...###..##############", "###..####################...###..##############", "###..####################...###..##############", "###..####..###...##...###...###........###", "###..###...###...##...###...###........###", "#########################...##############", "#########################...##############", "#########################...##############", ".....###...###...##", ".....###...###...##", ".....###...###...##", "###################", "###################", "###################", "###..###...###", "###..###...###", "###..#########", "###..#########", "###..#########", "###", "###", "###", "##############", "##############", "##############"];
const FRET_W = Math.max(...FRET.map(r => r.length)), FRET_H = FRET.length;
const fretSprites = {};
// 귀퉁이 무늬 한 장 (금빛 자개로 칠한 것). size = 무늬 가로 길이(px)
function fretSprite(size) {
  const key = Math.round(size * DPR);
  if (fretSprites[key]) return fretSprites[key];
  const cell = key / FRET_W;
  const c = document.createElement('canvas');
  c.width = Math.ceil(FRET_W * cell); c.height = Math.ceil(FRET_H * cell);
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  FRET.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') x.fillRect(Math.floor(i * cell), Math.floor(j * cell), Math.ceil(cell), Math.ceil(cell)); });
  x.globalCompositeOperation = 'source-atop';
  const main = ctx; ctx = x; x.fillStyle = nacre(0, 0, c.width, c.height); ctx = main;
  x.fillRect(0, 0, c.width, c.height);
  let sd = 7; const R = () => (sd = sd * 16807 % 2147483647) / 2147483647;
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${.15 + R() * .35})`; x.fillRect(R() * c.width, R() * c.height, 1 + R() * 3 * cell, 1 + R() * 3 * cell); }
  return (fretSprites[key] = c);
}
// 사각형 네 귀퉁이에 무늬 (안쪽을 향하게 뒤집어서)
function fretCorners(x0, y0, x1, y1, size) {
  const sp = fretSprite(size), w = sp.width / DPR, h = sp.height / DPR;
  ctx.save();
  ctx.shadowColor = 'rgba(240,200,130,.5)'; ctx.shadowBlur = size * 0.08;
  for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sx, sy); ctx.drawImage(sp, 0, 0, w, h); ctx.restore();
  }
  ctx.restore();
}
function lacquerFill(y, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, C.panelTop); g.addColorStop(1, C.panel);
  return g;
}

// 화면 테두리 = 네임택: 바깥 옻칠 띠 + 자개 금줄 + 네 귀퉁이 回자 무늬 (크기가 바뀔 때만 다시 그림)
function drawScreenFrame() {
  if (!C.frame) return;
  const key = `${W}x${H}|${DPR}`;
  if (!frameCache || frameCache.key !== key) frameCache = { key, cv: offscreen(() => {
    const u = L.u, band = u * 0.012, r = u * 0.022;
    // 옻칠 띠 (화면 가장자리)
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.roundRect(band, band, W - band * 2, H - band * 2, r);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16141C'); g.addColorStop(1, '#07070B');
    ctx.fillStyle = g; ctx.fill('evenodd');
    ctx.restore();
    // 자개 금줄
    ctx.beginPath(); ctx.roundRect(band + u * 0.004, band + u * 0.004, W - (band + u * 0.004) * 2, H - (band + u * 0.004) * 2, r * 0.8);
    goldStroke(0, 0, W, H, Math.max(1.5, u * 0.0028));
    // 귀퉁이 무늬
    const inset = band + u * 0.011;
    fretCorners(inset, inset, W - inset, H - inset, u * 0.06);
  }) };
  ctx.drawImage(frameCache.cv, 0, 0, W, H);
}

// 청사초롱 미로: 밤유리 바닥(뒤 별빛이 비침) + 옻칠 벽 + 길과 맞닿은 벽 가장자리를 금빛 선으로
function cheongMazeLayer(cs, ox, oy, mw, mh) {
  const k = cs * 0.3;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = cs * 0.8; ctx.shadowOffsetY = cs * 0.15;
  rr(ox, oy, mw, mh, k); ctx.fillStyle = '#07070B'; ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ox, oy, mw, mh, k); ctx.clip();
  const isWall = (x, y) => y < 0 || y >= maze.rows || x < 0 || x >= maze.cols || maze.grid[y][x] === '#';
  // 벽: 옻칠 (위쪽이 살짝 밝은 광택)
  ctx.fillStyle = lacquerFill(oy, mh); ctx.fillRect(ox, oy, mw, mh);
  // 길: 반투명 밤유리 → 배경 별빛이 은은히 보이도록 벽 칠을 지우고 다시 칠함
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) if (!isWall(x, y)) ctx.fillRect(ox + x * cs, oy + y * cs, cs + 0.5, cs + 0.5);
  ctx.restore();
  ctx.fillStyle = C.floor;
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) if (!isWall(x, y)) ctx.fillRect(ox + x * cs, oy + y * cs, cs + 0.5, cs + 0.5);
  // 금빛 가장자리
  ctx.beginPath();
  for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
    if (!isWall(x, y)) continue;
    const px = ox + x * cs, py = oy + y * cs;
    if (!isWall(x, y - 1)) { ctx.moveTo(px, py); ctx.lineTo(px + cs, py); }
    if (!isWall(x, y + 1)) { ctx.moveTo(px, py + cs); ctx.lineTo(px + cs, py + cs); }
    if (!isWall(x - 1, y)) { ctx.moveTo(px, py); ctx.lineTo(px, py + cs); }
    if (!isWall(x + 1, y)) { ctx.moveTo(px + cs, py); ctx.lineTo(px + cs, py + cs); }
  }
  ctx.lineCap = 'square';
  ctx.strokeStyle = nacre(ox, oy, ox + mw, oy + mh);
  ctx.shadowColor = 'rgba(244,200,120,.7)'; ctx.shadowBlur = cs * 0.25;
  ctx.lineWidth = Math.max(1.5, cs * 0.045); ctx.stroke();
  ctx.restore();
  // 바깥 테두리 + 귀퉁이 무늬 (미로판도 네임택처럼)
  rr(ox, oy, mw, mh, k); goldStroke(ox, oy, mw, mh, Math.max(2, cs * 0.06));
}

// 청사초롱 배경: 밤바다 그림(토끼·바위는 지운 판) + 움직이는 바다(물결 조각·달빛 길·윤슬) + 십자별·유성
// 별·유성은 수궁야행 4조 빔 화면(display.html)의 crossStar·bigStars·tinyStars·유성 코드를 그대로 옮김
const SEA_HZ = 0.524;   // 그림 속 수평선 높이 (그림 높이 비율)
const MOON_X = 0.68;    // 그림 속 달빛이 비치는 가로 위치 (화면 비율)

// ── 십자별 (원작과 같은 색·모양) ──
const SW = { core: '#FFFFFF', ray: '255,255,255', halo: '225,232,255', edge: '200,210,255' };
const SG = { core: '#FFE8BE', ray: '238,200,128', halo: '230,185,105', edge: '215,165,85' };
const rayDirs = deg => { const r = deg * Math.PI / 180; return [[Math.cos(r), Math.sin(r)], [-Math.sin(r), Math.cos(r)]]; };
const bigStars = [], tinyStars = [];
{
  let sseed = 11;
  const srnd = () => ((sseed = (sseed * 16807) % 2147483647) / 2147483647);
  // 큰 십자별 6개, 작은 십자별 16개. 하늘(수평선 위)에만, 서로 너무 붙지 않게
  while (bigStars.length < 6) {
    const c = { x: 0.04 + srnd() * 0.92, y: 0.04 + srnd() * 0.36, ph: srnd() * 6.28, sp: 0.8 + srnd() * 1.2 };
    if (bigStars.every(b => Math.hypot((b.x - c.x) * 1.78, b.y - c.y) > 0.32)) bigStars.push(c);
  }
  for (let i = 0; i < 16; i++) tinyStars.push({ x: srnd(), y: 0.02 + srnd() * 0.44, l: 3 + srnd() * 5, a: 0.5 + srnd() * 0.45 });
  // 가운데 쪽은 25°, 바깥은 35° · 크기는 1, 0.9, 0.7, 0.6 배 섞어서 · 흰색/샴페인골드 반반
  [...bigStars].sort((a, b) => Math.hypot(a.x - .5, a.y - .25) - Math.hypot(b.x - .5, b.y - .25))
    .forEach((b, i) => { b.dirs = rayDirs(i % 2 ? 35 : 25); b.k = [1, 0.9, 0.7, 1, 0.6, 0.9][i]; b.pal = i % 2 ? SG : SW; });
  tinyStars.forEach((t, i) => { t.dirs = rayDirs(i % 3 === 1 ? 35 : 25); t.pal = i % 2 ? SG : SW; });
}
function crossStar(g, x, y, len, core, alpha, pal, dirs) {
  g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = 'lighter';
  const halo = g.createRadialGradient(x, y, 0, x, y, len * 0.45);
  halo.addColorStop(0, `rgba(${pal.ray},.55)`); halo.addColorStop(0.25, `rgba(${pal.halo},.2)`); halo.addColorStop(1, `rgba(${pal.edge},0)`);
  g.fillStyle = halo; g.beginPath(); g.arc(x, y, len * 0.45, 0, Math.PI * 2); g.fill();
  dirs.forEach(([dx, dy]) => {
    const gr = g.createLinearGradient(x - dx * len, y - dy * len, x + dx * len, y + dy * len);
    gr.addColorStop(0, `rgba(${pal.ray},0)`); gr.addColorStop(0.5, `rgba(${pal.ray},.95)`); gr.addColorStop(1, `rgba(${pal.ray},0)`);
    g.strokeStyle = gr; g.lineWidth = Math.max(0.6, core * 0.45);
    g.beginPath(); g.moveTo(x - dx * len, y - dy * len); g.lineTo(x + dx * len, y + dy * len); g.stroke();
  });
  g.fillStyle = pal.core; g.beginPath(); g.arc(x, y, core, 0, Math.PI * 2); g.fill();
  g.restore();
}

// ── 유성 (원작: 한 번에 하나, 10~22초마다 오른쪽 위 → 왼쪽 아래, 빛 알갱이를 흩뿌림) ──
const meteors = [], meteorDust = [];
let meteorNext = performance.now() + 4000;
function drawMeteors(now, u) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = meteorDust.length - 1; i >= 0; i--) {
    const d = meteorDust[i], age = (now - d.born) / d.life;
    if (age >= 1) { meteorDust.splice(i, 1); continue; }
    const tdt = (now - d.born) / 1000;
    const blink = Math.sin(tdt * d.sp + d.ph) > -0.2 ? 1 : 0.15;       // 켜졌다 꺼졌다
    ctx.globalAlpha = d.a * (1 - age) * blink;
    ctx.fillStyle = 'rgb(190,210,255)';
    ctx.beginPath(); ctx.arc(d.x + d.vx * tdt, d.y + d.vy * tdt, d.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (meteorDust.length > 600) meteorDust.splice(0, meteorDust.length - 600);
  if (!meteors.length) {
    if (now < meteorNext) return;
    const ang = Math.PI * (0.70 + Math.random() * 0.07);
    const sx = W * (0.45 + Math.random() * 0.45), sy = H * (0.02 + Math.random() * 0.12);
    const dist = H * (0.24 + Math.random() * 0.1), dur = 2200 + Math.random() * 900;
    meteors.push({ t0: now, dur, sx, sy, ang, dist, len: H * (0.27 + Math.random() * 0.08), w: 1 });
    if (Math.random() < 0.35) {                                      // 짝 유성: 조금 뒤·아래에서 나란히, 더 작고 짧게
      const off = H * (0.05 + Math.random() * 0.04);
      meteors.push({ t0: now + 250 + Math.random() * 300, dur: dur * 0.9, sx: sx - Math.sin(ang) * off * 1.4 + Math.cos(ang) * off * 0.6,
        sy: sy + Math.cos(ang) * off * 1.4 + Math.sin(ang) * off * 0.6, ang, dist: dist * 0.85, len: H * 0.17, w: 0.7 });
    }
  }
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i], p = (now - m.t0) / m.dur;
    if (p < 0) continue;
    if (p >= 1) { meteors.splice(i, 1); if (!meteors.length) meteorNext = now + 10000 + Math.random() * 12000; continue; }
    const e = 1 - Math.pow(1 - p, 1.3);
    const dx = Math.cos(m.ang), dy = Math.sin(m.ang);
    const hx = m.sx + dx * m.dist * e, hy = m.sy + dy * m.dist * e;
    const Ln = m.len * Math.min(1, p * 2.2) * (1 - Math.max(0, p - 0.75) / 0.25 * 0.5);
    const fade = (p < 0.1 ? p / 0.1 : (p > 0.72 ? (1 - p) / 0.28 : 1)) * m.w;
    if (!m.burstT || now > m.burstT) { m.rate = Math.random() < 0.25 ? 280 + Math.random() * 140 : 90 + Math.random() * 90; m.burstT = now + 120 + Math.random() * 380; }
    m.acc = (m.acc || 0) + m.rate * m.w * Math.min(0.1, (now - (m.lastEmit || now)) / 1000); m.lastEmit = now;
    const emit = Math.floor(m.acc); m.acc -= emit;
    for (let k = 0; k < emit; k++) {
      const back = Math.pow(Math.random(), 1.6) * 0.5 * m.len * Math.min(1, p * 2.2);
      const side = (Math.random() - 0.5) * (Math.random() < 0.2 ? 26 : 10) * u;
      meteorDust.push({ x: hx - Math.cos(m.ang) * back - Math.sin(m.ang) * side, y: hy - Math.sin(m.ang) * back + Math.cos(m.ang) * side,
        vx: (Math.random() - 0.5) * 6 * u, vy: (4 + Math.random() * 10) * u,
        born: now, life: 500 + Math.random() * 2000, r: (0.45 + Math.random() * 0.85) * u, ph: Math.random() * 6.28, sp: 3 + Math.random() * 16, a: fade * (Math.random() < 0.12 ? 0.85 : 0.4 + Math.random() * 0.3) });
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    const tx = hx - dx * Ln, ty = hy - dy * Ln, nx = -dy, ny = dx, w0 = 2.4 * u * m.w;
    const tg = ctx.createLinearGradient(hx, hy, tx, ty);
    tg.addColorStop(0, `rgba(255,255,255,${0.95 * fade})`); tg.addColorStop(0.07, `rgba(255,255,255,${0.85 * fade})`);
    tg.addColorStop(0.4, `rgba(245,248,255,${0.5 * fade})`); tg.addColorStop(0.75, `rgba(230,238,255,${0.22 * fade})`); tg.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(hx - nx * w0, hy - ny * w0);
    ctx.ellipse(hx, hy, w0 * 1.9, w0, m.ang, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
    const cg = ctx.createLinearGradient(hx, hy, hx - dx * Ln * 0.5, hy - dy * Ln * 0.5);
    cg.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`); cg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = cg; ctx.lineWidth = 0.8 * u * m.w;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - dx * Ln * 0.5, hy - dy * Ln * 0.5); ctx.stroke();
    ctx.globalAlpha = fade;
    ctx.translate(hx, hy); ctx.rotate(m.ang); ctx.scale(2.6, 1);
    const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, 7 * u * m.w);
    hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(0.35, 'rgba(200,215,255,.7)'); hg.addColorStop(1, 'rgba(150,170,255,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, 7 * u * m.w, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ── 바다: 원근에 맞춘 가로 물결 조각 + 달빛 길 + 윤슬 (Codex 제안 값) ──
let seaParts = null;
function buildSea(hz) {
  const R = rand(8128), parts = { waves: [], moon: [], glints: [] };
  const yAt = d => hz + (H - hz) * d;
  // 물결 조각 130개: 수평선 가까이 촘촘하고 작게, 앞으로 올수록 길고 굵게
  for (let i = 0; i < 140; i++) {
    const d = Math.pow(R(), 1.35);
    parts.waves.push({ d, y: yAt(d), x: R() * W, len: (8 + 80 * d * d + R() * 20 * d) * (0.6 + 0.6 * d), th: 1 + 2 * d,
      a: 0.06 + R() * 0.1, dark: R() < 0.4, per: 5000 + R() * 4000, ph: R() * 6.28, drift: (R() - 0.5) * 6 });
  }
  // 달빛 길 46조각: 수평선에선 폭이 좁고, 앞으로 올수록 넓어지는 끊어진 가로 띠
  for (let i = 0; i < 46; i++) {
    const d = Math.pow(R(), 1.2);
    const spread = 20 + 340 * d;
    parts.moon.push({ d, y: yAt(d), x: W * MOON_X + (R() - 0.5) * spread * 1.4, len: (0.25 + R() * 0.75) * (10 + 150 * d),
      th: 1 + 2.5 * d, a: 0.08 + R() * 0.16, per: 1500 + R() * 1500, ph: R() * 6.28 });
  }
  // 윤슬 52개: 70%는 달빛 길 둘레, 나머지는 바다 곳곳. 가로로 긴 작은 반짝임
  for (let i = 0; i < 52; i++) {
    const d = Math.pow(R(), 1.1), near = R() < 0.7;
    const x = near ? W * MOON_X + (R() - 0.5) * (40 + 420 * d) : R() * W;
    const center = Math.abs(x - W * MOON_X) < 150;
    parts.glints.push({ x, y: yAt(d), w: 2 + 8 * d, h: 1 + d, per: 1500 + R() * 1500, ph: R() * 6.28, a: Math.min(1, (near ? 0.9 : 0.55) * (center ? 1.15 : 0.8)) });
  }
  return parts;
}
function drawSea(t, hz) {
  if (!seaParts || seaParts.key !== `${W}x${H}|${hz}`) { seaParts = buildSea(hz); seaParts.key = `${W}x${H}|${hz}`; }
  const s = t / 1000;
  ctx.save();
  ctx.lineCap = 'round';
  // 물결: 밝은 마루 + 어두운 골, 5~9초 주기로 천천히 출렁이며 옆으로 흐름
  for (const w of seaParts.waves) {
    const k = Math.sin(t / w.per * 6.28 + w.ph);
    const y = w.y + k * (0.5 + 1.5 * w.d);
    const x = ((w.x + s * w.drift) % (W + w.len) + W + w.len) % (W + w.len) - w.len / 2;
    ctx.globalAlpha = w.a * (0.75 + 0.25 * k);
    ctx.strokeStyle = w.dark ? 'rgb(4,6,26)' : 'rgb(185,200,255)';
    ctx.lineWidth = w.th;
    ctx.beginPath(); ctx.moveTo(x - w.len / 2, y); ctx.quadraticCurveTo(x, y - w.th * 1.2 * k, x + w.len / 2, y); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'lighter';
  // 달빛 길: 조각마다 1.5~3초로 밝아졌다 어두워짐
  for (const m of seaParts.moon) {
    const k = 0.5 + 0.5 * Math.sin(t / m.per * 6.28 + m.ph);
    ctx.globalAlpha = m.a * (0.35 + 0.65 * k);
    ctx.strokeStyle = 'rgb(215,225,255)'; ctx.lineWidth = m.th;
    const y = m.y + Math.sin(t / 2600 + m.ph) * (0.5 + 1.5 * m.d);
    ctx.beginPath(); ctx.moveTo(m.x - m.len / 2, y); ctx.lineTo(m.x + m.len / 2, y); ctx.stroke();
  }
  // 윤슬: 잠깐 반짝 켜졌다 꺼짐
  ctx.fillStyle = 'rgb(235,240,255)';
  for (const g of seaParts.glints) {
    const k = Math.max(0, Math.sin(t / g.per * 6.28 + g.ph));
    const a = k * k * k * g.a;
    if (a < 0.03) continue;
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.ellipse(g.x, g.y, g.w / 2, g.h / 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function cheongBackground(t) {
  const ok = cheongBg.complete && cheongBg.naturalWidth;
  let hz = H * SEA_HZ;
  const key = `${W}x${H}|${DPR}|${ok ? 1 : 0}`;
  if (!bgCache || bgCache.key !== key) bgCache = { key, cv: offscreen(() => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0B1033'); g.addColorStop(0.52, '#141A4A'); g.addColorStop(0.53, '#10184A'); g.addColorStop(1, '#070A24');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    let h = H * SEA_HZ;
    if (ok) {
      const sc = Math.max(W / cheongBg.naturalWidth, H / cheongBg.naturalHeight);
      const iw = cheongBg.naturalWidth * sc, ih = cheongBg.naturalHeight * sc, oy = (H - ih) / 2;
      ctx.drawImage(cheongBg, (W - iw) / 2, oy, iw, ih);
      h = oy + SEA_HZ * ih;
    }
    // 바다를 하늘보다 살짝 깊고 진하게 + 앞(아래)쪽은 더 어둡게
    const sg = ctx.createLinearGradient(0, h, 0, H);
    sg.addColorStop(0, 'rgba(20,30,90,0)'); sg.addColorStop(1, 'rgba(2,4,18,.35)');
    ctx.fillStyle = sg; ctx.fillRect(0, h, W, H - h);
    // 바다 전체에 잔물결 결 (고정): 수평선 가까이 촘촘하고 얇게, 앞으로 올수록 길고 굵게
    {
      const R = rand(5150);
      ctx.lineCap = 'round';
      for (let i = 0; i < 900; i++) {
        const d = Math.pow(R(), 1.5), y = h + (H - h) * d, x = R() * W;
        const len = (6 + 110 * d * d * (0.4 + R() * 0.6)) * (0.6 + 0.6 * d), th = 0.8 + 2.2 * d;
        const light = R() < 0.55;
        ctx.globalAlpha = (light ? 0.035 : 0.06) + R() * 0.05;
        ctx.strokeStyle = light ? 'rgb(170,188,255)' : 'rgb(3,5,22)';
        ctx.lineWidth = th;
        ctx.beginPath();
        if (len > 60) { const gap = len * (0.08 + R() * 0.1); ctx.moveTo(x - len / 2, y); ctx.lineTo(x - gap / 2, y); ctx.moveTo(x + gap / 2, y); ctx.lineTo(x + len / 2, y); }
        else { ctx.moveTo(x - len / 2, y); ctx.quadraticCurveTo(x, y + (R() - 0.5) * th * 2, x + len / 2, y); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // 수평선: 선 대신 흐린 청회색 빛 띠
    const hb = ctx.createLinearGradient(0, h - 8.5, 0, h + 8.5);
    hb.addColorStop(0, 'rgba(150,170,230,0)'); hb.addColorStop(0.5, 'rgba(160,180,240,.105)'); hb.addColorStop(1, 'rgba(150,170,230,0)');
    ctx.fillStyle = hb; ctx.fillRect(0, h - 8.5, W, 17);
  }) };
  if (ok) {
    const sc = Math.max(W / cheongBg.naturalWidth, H / cheongBg.naturalHeight);
    hz = (H - cheongBg.naturalHeight * sc) / 2 + SEA_HZ * cheongBg.naturalHeight * sc;
  }
  ctx.drawImage(bgCache.cv, 0, 0, W, H);
  drawSea(t, Math.round(hz));
  // 십자별 (원작 그대로: u = H/900)
  const u = H / 900, s = t / 1000;
  tinyStars.forEach(st => crossStar(ctx, st.x * W, st.y * H, st.l * u, 0.7 * u, st.a * (0.75 + 0.25 * Math.sin(s * 1.3 + st.x * 40)), st.pal, st.dirs));
  bigStars.forEach(b => {
    const tw = 0.82 + 0.18 * Math.sin(s * b.sp + b.ph);
    crossStar(ctx, b.x * W, b.y * H, (34 + 22 * 0.9) / 1.5 * b.k * tw * u * 1.25, (1.6 + 0.9) / 1.5 * Math.sqrt(b.k) * u * 1.25, tw, b.pal, b.dirs);
  });
  drawMeteors(t, u);
}

function drawMaze(t) {
  const { cs, ox, oy, mw, mh } = mazeGeom();
  if (C.dark) {
    // 바닥·벽·빛나는 테두리는 미로가 바뀔 때만 다시 그림 (빛 번짐이 무거워서)
    const key = `${themeName}|${maze.grid.join('')}|${cs}|${ox}|${oy}|${W}x${H}|${DPR}`;
    if (!mazeCache || mazeCache.key !== key) mazeCache = { key, cv: offscreen(() => (C.cheong ? cheongMazeLayer : neonMazeLayer)(cs, ox, oy, mw, mh)) };
    ctx.drawImage(mazeCache.cv, 0, 0, W, H);
    ctx.save();
  } else {
  // 바닥
  ctx.save();
  ctx.shadowColor = `rgba(${C.shadowRGB},.16)`; ctx.shadowBlur = cs * 0.6; ctx.shadowOffsetY = cs * 0.18;
  rr(ox, oy, mw, mh, cs * 0.3); ctx.fillStyle = C.wall; ctx.fill();
  ctx.restore();
  // 미로 바깥 모서리를 둥글게: 이후 바닥·벽은 모두 이 안에만 그림
  ctx.save();
  rr(ox, oy, mw, mh, cs * 0.3); ctx.clip();
  ctx.fillStyle = C.floor; ctx.fillRect(ox, oy, mw, mh);
  }

  // 출구
  const ex = ox + maze.exit.x * cs, ey = oy + maze.exit.y * cs;
  const glow = 0.5 + 0.5 * Math.sin(t / 300);
  ctx.save();
  ctx.shadowColor = C.exit; ctx.shadowBlur = cs * (0.4 + glow * 0.6);
  rr(ex + cs * 0.1, ey + cs * 0.1, cs * 0.8, cs * 0.8, cs * 0.2); ctx.fillStyle = C.exit; ctx.fill();
  ctx.restore();
  text('출구', ex + cs / 2, ey + cs / 2, cs * 0.3, C.exitInk, 800);

  // 출발점
  const sx = ox + maze.start.x * cs, sy = oy + maze.start.y * cs;
  ctx.beginPath(); ctx.arc(sx + cs / 2, sy + cs / 2, cs * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = C.startMark; ctx.fill();

  // 지나온 길
  trail.forEach((p, i) => {
    const a = (i + 1) / trail.length;
    ctx.beginPath(); ctx.arc(ox + (p.x + 0.5) * cs, oy + (p.y + 0.5) * cs, cs * (0.06 + 0.06 * a), 0, Math.PI * 2);
    ctx.globalAlpha = 0.25 + a * 0.6; ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1;
  });

  // 벽 (그림자 → 본체)
  if (!C.dark) {
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
  }
  ctx.restore();
  return { cs, ox, oy };
}

const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
function emoji(str, x, y, size) {
  ctx.font = `${size}px ${EMOJI_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000'; ctx.fillText(str, x, y);
}
function drawGimmicks(t, g) {
  const { cs, ox, oy } = g;
  // 얼음
  if (maze.ice && maze.ice.size) {
    for (const k of maze.ice) {
      const [x, y] = k.split(',').map(Number);
      const px = ox + x * cs, py = oy + y * cs;
      ctx.fillStyle = C.iceFill; ctx.fillRect(px, py, cs, cs);
      ctx.save();
      ctx.beginPath(); ctx.rect(px, py, cs, cs); ctx.clip();
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(2, cs * 0.06);
      const sh = ((t / 18) % (cs * 2)) - cs * 0.5; // 반짝이는 빛줄기
      for (const o of [0.25, 0.55]) {
        ctx.beginPath(); ctx.moveTo(px + cs * o + sh * 0.2, py + cs * 0.8); ctx.lineTo(px + cs * (o + 0.22) + sh * 0.2, py + cs * 0.2); ctx.stroke();
      }
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#fff'; ctx.fillRect(px + sh, py, cs * 0.18, cs);
      ctx.restore();
      ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = Math.max(2, cs * 0.05);
      ctx.strokeRect(px + ctx.lineWidth / 2, py + ctx.lineWidth / 2, cs - ctx.lineWidth, cs - ctx.lineWidth);
    }
  }
  // 블랙홀 → 화이트홀 (흐르는 점선으로 방향 표시)
  for (const h of maze.holes || []) {
    const bx = ox + (h.b.x + 0.5) * cs, by = oy + (h.b.y + 0.5) * cs;
    const wx = ox + (h.w.x + 0.5) * cs, wy = oy + (h.w.y + 0.5) * cs;
    const mx = (bx + wx) / 2 - (wy - by) * 0.18, my = (by + wy) / 2 + (wx - bx) * 0.18;
    ctx.save();
    ctx.setLineDash([cs * 0.12, cs * 0.2]); ctx.lineDashOffset = -t / 25;
    ctx.strokeStyle = h.color; ctx.globalAlpha = 0.6; ctx.lineWidth = Math.max(3, cs * 0.08); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(mx, my, wx, wy); ctx.stroke();
    ctx.restore();
    // 화이트홀 쪽 화살촉 (어느 쪽으로 나오는지)
    {
      const ang = Math.atan2(wy - my, wx - mx), r0 = cs * 0.5, a = cs * 0.28;
      const tx = wx - Math.cos(ang) * r0, ty = wy - Math.sin(ang) * r0;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(a * 0.6, 0); ctx.lineTo(-a * 0.6, -a * 0.55); ctx.lineTo(-a * 0.6, a * 0.55); ctx.closePath();
      ctx.fillStyle = h.color; ctx.globalAlpha = 0.95; ctx.fill();
      ctx.restore();
    }
    // 화이트홀: 하얗게 빛나는 원 + 바깥으로 도는 빛살
    ctx.save(); ctx.translate(wx, wy);
    const pulse = 1 + 0.06 * Math.sin(t / 200);
    const gw = ctx.createRadialGradient(0, 0, 0, 0, 0, cs * 0.5 * pulse);
    gw.addColorStop(0, '#FFFFFF'); gw.addColorStop(0.45, '#FFFFFF'); gw.addColorStop(0.75, h.color + '88'); gw.addColorStop(1, h.color + '00');
    ctx.fillStyle = gw; ctx.beginPath(); ctx.arc(0, 0, cs * 0.5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(-t / 900);
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(1.5, cs * 0.04);
    for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(cs * 0.3, 0); ctx.lineTo(cs * 0.44, 0); ctx.stroke(); }
    ctx.restore();
    // 블랙홀: 검은 중심 + 빨려 들어가는 소용돌이
    ctx.save(); ctx.translate(bx, by);
    const gb = ctx.createRadialGradient(0, 0, 0, 0, 0, cs * 0.5);
    gb.addColorStop(0, '#000000'); gb.addColorStop(0.5, '#120A24'); gb.addColorStop(0.8, h.color + 'AA'); gb.addColorStop(1, h.color + '00');
    ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(0, 0, cs * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(t / 260);
    ctx.strokeStyle = h.color; ctx.lineWidth = Math.max(1.5, cs * 0.05); ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.beginPath(); ctx.arc(cs * 0.08, 0, cs * 0.28, -0.4, 1.3); ctx.stroke();
    }
    ctx.restore();
  }
  // 화이트홀에서 튀어나올 때 고리
  if (holeFx) {
    const k = (t - holeFx.t0) / 500;
    if (k >= 1) holeFx = null;
    else {
      ctx.beginPath(); ctx.arc(ox + (holeFx.x + 0.5) * cs, oy + (holeFx.y + 0.5) * cs, cs * (0.3 + k * 0.9), 0, Math.PI * 2);
      ctx.strokeStyle = holeFx.color; ctx.globalAlpha = 1 - k; ctx.lineWidth = cs * 0.1; ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
}

function drawItems(t, g) {
  const { cs, ox, oy } = g;
  for (const it of items) {
    if (it.taken) continue;
    const I = ITEM[it.type];
    const bob = Math.sin(t / 260 + it.x * 1.7 + it.y) * cs * 0.06;
    const cx = ox + (it.x + 0.5) * cs, cy = oy + (it.y + 0.5) * cs + bob;
    const glow = 0.5 + 0.5 * Math.sin(t / 220 + it.x);
    // 흰 배지 + 아이템 색 테두리 (바닥과 확실히 구분되게)
    ctx.save();
    ctx.shadowColor = I.color; ctx.shadowBlur = cs * (0.25 + glow * 0.35);
    ctx.beginPath(); ctx.arc(cx, cy, cs * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = C.badgeFill; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, cs * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = I.color + '33'; ctx.fill();
    ctx.lineWidth = Math.max(2, cs * 0.06); ctx.strokeStyle = I.color; ctx.stroke();
    emoji(I.icon, cx, cy + cs * 0.02, cs * 0.46);
  }
  // 먹은 자리에서 퍼지는 고리
  for (const r of itemRings) {
    const k = (t - r.t0) / 600;
    if (k >= 1) continue;
    ctx.beginPath(); ctx.arc(ox + (r.x + 0.5) * cs, oy + (r.y + 0.5) * cs, cs * (0.35 + easeOut(k) * 0.9), 0, Math.PI * 2);
    ctx.strokeStyle = r.color; ctx.globalAlpha = 1 - k; ctx.lineWidth = cs * 0.1; ctx.stroke(); ctx.globalAlpha = 1;
  }
  itemRings = itemRings.filter(r => t - r.t0 < 600);
  // 부스트 중: 캐릭터 주위 주황 불꽃 고리
  if (char.boost) {
    const k = char.t0 ? clamp((t - char.t0) / (char.dur || MOVE_MS), 0, 1) : 1;
    const e = easeOut(k);
    const cx = ox + (char.fx + (char.x - char.fx) * e + 0.5) * cs, cy = oy + (char.fy + (char.y - char.fy) * e + 0.5) * cs;
    ctx.save();
    ctx.shadowColor = ITEM.boost.color; ctx.shadowBlur = cs * 0.8;
    ctx.beginPath(); ctx.arc(cx, cy, cs * (0.48 + 0.05 * Math.sin(t / 40)), 0, Math.PI * 2);
    ctx.strokeStyle = ITEM.boost.color; ctx.lineWidth = cs * 0.1; ctx.stroke();
    ctx.restore();
  }
}
function drawPopups(t, g) {
  const { cs, ox, oy } = g;
  for (const p of popups) {
    const k = (t - p.t0) / 1400;
    if (k >= 1) continue;
    const x = ox + (p.x + 0.5) * cs, y = oy + (p.y + 0.2) * cs - easeOut(k) * cs * 1.2;
    const size = Math.max(16, cs * 0.5);
    ctx.save();
    ctx.globalAlpha = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
    ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = size * 0.22; ctx.strokeStyle = C.popupStroke; ctx.lineJoin = 'round';
    ctx.strokeText(p.str, x, y);
    ctx.fillStyle = p.color === ITEM.star.color ? '#E8A500' : p.color; ctx.fillText(p.str, x, y);
    ctx.restore();
  }
  popups = popups.filter(p => t - p.t0 < 1400);
}

function drawChar(t, g) {
  const { cs, ox, oy } = g;
  const k = char.t0 ? clamp((t - char.t0) / (char.dur || MOVE_MS), 0, 1) : 1;
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
  if (char.hole) {
    const hk = clamp((t - char.hole.t0 - (char.dur || MOVE_MS)) / 240, 0, 1);
    ctx.rotate(hk * Math.PI * 3); ctx.scale(1 - hk * 0.95, 1 - hk * 0.95);
  } else if (char.pop && t - char.pop < 300) {
    const pk = easeOut((t - char.pop) / 300);
    const sc = 0.2 + 0.8 * pk + Math.sin(pk * Math.PI) * 0.25;
    ctx.scale(sc, sc);
  }
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
  ctx.fillStyle = C.charFill; ctx.fill();
  if (C.charGlow) { ctx.save(); ctx.shadowColor = C.charLine; ctx.shadowBlur = cs * 0.35; }
  ctx.lineWidth = Math.max(2, cs * 0.06); ctx.strokeStyle = C.charLine; ctx.stroke();
  if (C.charGlow) ctx.restore();
  // 눈 (바라보는 방향)
  const lx = p.dx * r * 0.25, ly = p.dy * r * 0.2;
  const blink = (t % 3200) < 120 ? 0.2 : 1;
  ctx.fillStyle = C.charEye;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(lx + s * r * 0.32, ly - r * 0.1, r * 0.11, r * 0.15 * blink, 0, 0, Math.PI * 2); ctx.fill();
  }
  // 볼
  ctx.fillStyle = 'rgba(255,107,107,.35)';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(lx + s * r * 0.55, ly + r * 0.22, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// 화살표는 테마 글꼴이 가늘어도(고운바탕 등) 항상 굵은 고딕으로
function arrowText(str, x, y, size, color) {
  const f = FONT; FONT = THEMES.classic.font;
  if (C.dark) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = size * 0.25; }
  text(str, x, y, size, color, 800);
  if (C.dark) ctx.restore();
  FONT = f;
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
    shape(x - 8, y - 8, b.w + 16, b.h + 16, r + 8);
    ctx.lineWidth = 6; ctx.strokeStyle = p.color; ctx.globalAlpha = 0.3 + g * 0.7; ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (bot) {
    ctx.save();
    ctx.shadowColor = `rgba(${C.shadowRGB},.08)`; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
    shape(x, y, b.w, b.h, r); ctx.fillStyle = C.dark ? neonFill(y, b.h) : '#FFFFFF'; ctx.fill();
    ctx.restore();
    if (C.dark) neonStroke(x, y, b.w, b.h, p.color, p.color);
    else { ctx.lineWidth = Math.max(2.5, L.u * 0.003); ctx.strokeStyle = p.color; ctx.stroke(); }
    if (cd.pulse > 0) { shape(x, y, b.w, b.h, r); ctx.fillStyle = p.color; ctx.globalAlpha = cd.pulse * 0.35; ctx.fill(); ctx.globalAlpha = 1; }
  } else if (joined) {
    ctx.save();
    ctx.shadowColor = `rgba(${C.shadowRGB},.15)`; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
    shape(x, y, b.w, b.h, r);
    if (C.dark) { ctx.fillStyle = neonFill(y, b.h); ctx.fill(); ctx.fillStyle = p.color + (C.cheong ? '55' : '66'); ctx.fill(); }
    else { ctx.fillStyle = p.color; ctx.fill(); }
    ctx.restore();
    if (C.dark) { shape(x, y, b.w, b.h, r); neonStroke(x, y, b.w, b.h, p.color, p.color, Math.max(2.5, L.u * 0.004)); }
    if (cd.pulse > 0) { shape(x, y, b.w, b.h, r); ctx.fillStyle = `rgba(255,255,255,${cd.pulse * 0.35})`; ctx.fill(); }
  } else {
    shape(x, y, b.w, b.h, r); ctx.fillStyle = C.emptyCard; ctx.fill();
    ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.strokeStyle = p.color; ctx.stroke(); ctx.setLineDash([]);
  }

  // 사람이 들어온 카드는 색 면 + 흰 글자, 나머지는 화살표만 방향 색이고 글자는 진하게
  const fg = joined ? '#fff' : C.ink;
  const arrowC = joined ? '#fff' : p.color;
  const sub = joined ? 'rgba(255,255,255,.88)' : C.muted;
  let status = joined ? '참가 완료' : '빈 자리';
  if (state !== 'lobby' && joined && stats[d]) status = `${stats[d].moves}칸 이동`;
  if (bot) status = '🤖 도우미';
  if (cd.wrong > 0) status = `${p.arrow} 방향만 가능!`;
  if (myTurn) status = `지금 ${p.arrow} 차례!`;
  if (cd.poked > 0 && cd.pokeFrom) status = `${P[cd.pokeFrom].arrow}가 콕! 찔렀어요`;

  if (b.vertical) {
    const s = b.w;
    arrowText(p.arrow, 0, y + b.h * 0.3, s * 0.42, arrowC);
    text(p.label, 0, y + b.h * 0.6, s * 0.17, fg, 800);
    text(status, 0, y + b.h * 0.8, s * 0.12, sub, 600);
  } else {
    const s = b.h;
    arrowText(p.arrow, x + s * 0.55, 0, s * 0.6, arrowC);
    text(p.label, x + s * 1.05, -s * 0.12, s * 0.3, fg, 800, 'left');
    text(status, x + s * 1.05, s * 0.22, s * 0.2, sub, 600, 'left');
  }
  ctx.restore();
}

// 흰 카드 (부드러운 그림자)
// 네온 테마: 모서리 두 곳(왼쪽 위·오른쪽 아래)을 깎은 테두리
function shape(x, y, w, h, r) {
  if (!C.neon) return rr(x, y, w, h, r);
  const k = Math.max(4, Math.min(r * 0.9, w * 0.25, h * 0.35));
  ctx.beginPath();
  ctx.moveTo(x + k, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - k);
  ctx.lineTo(x + w - k, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + k); ctx.closePath();
}
function neonFill(y, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, C.panelTop); g.addColorStop(1, C.panel);
  return g;
}
// 현재 경로에 하늘색→보라 그라데이션 테두리 + 빛 번짐
function neonStroke(x, y, w, h, a = C.edgeA, b = C.edgeB, lw = 0) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.save();
  ctx.shadowColor = b; ctx.shadowBlur = L.u * 0.012;
  ctx.strokeStyle = g; ctx.lineWidth = lw || Math.max(1.5, L.u * 0.0022); ctx.stroke();
  ctx.restore();
}
// 큰 패널 장식: 왼쪽 위 하늘색 꺾쇠, 오른쪽 아래 보라 꺾쇠, 오른쪽 위 점선
function neonBrackets(x, y, w, h, k) {
  const u = L.u, len = Math.min(w, h) * 0.18;
  ctx.save();
  ctx.lineWidth = Math.max(2.5, u * 0.004); ctx.lineCap = 'round';
  ctx.shadowBlur = u * 0.015;
  ctx.strokeStyle = ctx.shadowColor = C.edgeA;
  ctx.beginPath(); ctx.moveTo(x, y + k + len * 0.6); ctx.lineTo(x, y + k); ctx.lineTo(x + k, y); ctx.lineTo(x + k + len, y); ctx.stroke();
  ctx.strokeStyle = ctx.shadowColor = C.edgeB;
  ctx.beginPath(); ctx.moveTo(x + w, y + h - k - len * 0.6); ctx.lineTo(x + w, y + h - k); ctx.lineTo(x + w - k, y + h); ctx.lineTo(x + w - k - len, y + h); ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = C.edgeB;
  const sw = u * 0.012, sh = Math.max(2, u * 0.003);
  for (let i = 0; i < 5; i++) ctx.fillRect(x + w - u * 0.02 - (i + 1) * sw * 1.4, y + u * 0.012, sw, sh);
  ctx.restore();
}

function card(x, y, w, h, r, fill = C.panel, stroke = null) {
  if (C.cheong) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = L.u * 0.02; ctx.shadowOffsetY = L.u * 0.005;
    rr(x, y, w, h, r); ctx.fillStyle = fill === C.panel ? lacquerFill(y, h) : fill; ctx.fill();
    ctx.restore();
    rr(x + 3, y + 3, w - 6, h - 6, Math.max(2, r - 3));
    if (stroke) neonStroke(x, y, w, h, stroke, stroke, Math.max(2, L.u * 0.003)); else goldStroke(x, y, w, h);
    return;
  }
  if (C.neon) {
    shape(x, y, w, h, r); ctx.fillStyle = fill === C.panel ? neonFill(y, h) : fill; ctx.fill();
    shape(x, y, w, h, r);
    if (stroke) neonStroke(x, y, w, h, stroke, stroke, Math.max(2, L.u * 0.003)); else neonStroke(x, y, w, h);
    return;
  }
  ctx.save();
  ctx.shadowColor = `rgba(${C.shadowRGB},.10)`; ctx.shadowBlur = L.u * 0.02; ctx.shadowOffsetY = L.u * 0.004;
  rr(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
  if (stroke) { rr(x, y, w, h, r); ctx.lineWidth = Math.max(2, L.u * 0.003); ctx.strokeStyle = stroke; ctx.stroke(); }
}
// 숫자 폭을 고정해서 그리기 (타이머가 흔들리지 않게)
function monoText(str, x, y, size, color, weight = 800, align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  const dw = ctx.measureText('0').width;
  const ws = [...str].map(ch => /\d/.test(ch) ? dw : ctx.measureText(ch).width);
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [...str].forEach((ch, i) => { ctx.fillText(ch, cx + ws[i] / 2, y); cx += ws[i]; });
  return total;
}

function drawHUD(t) {
  const u = L.u, pad = L.pad;
  const elapsed = state === 'play' ? stageElapsed(t) : state === 'clear' ? stageTimes[stageTimes.length - 1] : 0;
  const total = stageTimes.reduce((a, b) => a + b, 0) + (state === 'play' ? elapsed : 0);
  const itemRun = runMode === 'item';
  const frozen = state === 'play' && isFrozen(t);
  const ch = u * 0.115, cr = u * 0.022, ip = u * 0.022;
  const timeSize = u * 0.046;

  // 왼쪽 위: 스테이지 + 이번 판 기록
  {
    const head = `STAGE ${stageIdx + 1}/${STAGES.length} · ${STAGES[stageIdx].name}`;
    ctx.font = `700 ${u * 0.02}px ${FONT}`;
    const hw = ctx.measureText(head).width;
    ctx.font = `800 ${timeSize}px ${FONT}`;
    const tw = ctx.measureText((frozen ? '⏸ ' : '') + '00:00.00').width;
    const cw = Math.max(u * 0.27, hw + ip * 2 + (itemRun ? u * 0.1 : 0), tw + ip * 2.4);
    card(pad, pad, cw, ch, cr, frozen ? C.frozenFill : C.panel, frozen ? ITEM.glass.color : null);
    text(head, pad + ip, pad + ch * 0.3, u * 0.02, C.muted, 700, 'left');
    if (itemRun) {
      const bx = pad + ip + hw + u * 0.012, bh = u * 0.03, bw = u * 0.085;
      rr(bx, pad + ch * 0.3 - bh / 2, bw, bh, bh / 2); ctx.fillStyle = C.chipBg; ctx.fill();
      text('🎁 아이템전', bx + bw / 2, pad + ch * 0.3 + 1, u * 0.015, C.chipInk, 800);
    }
    monoText((frozen ? '⏸ ' : '') + fmt(elapsed), pad + ip, pad + ch * 0.68, timeSize, frozen ? ITEM.glass.ink : C.ink, 800, 'left');
    if (frozen) {
      // 정지 남은 시간 막대
      const f = freezes.find(([a, b]) => t >= a && t < b);
      const left = (f[1] - t) / (f[1] - f[0]);
      const bw = cw - ip * 2, bh = Math.max(4, u * 0.006), by = pad + ch - ip * 0.55;
      rr(pad + ip, by, bw, bh, bh / 2); ctx.fillStyle = C.frozenTrack; ctx.fill();
      rr(pad + ip, by, Math.max(bh, bw * left), bh, bh / 2); ctx.fillStyle = ITEM.glass.color; ctx.fill();
    }
  }
  // 오른쪽 위: 누적 기록
  {
    const cw = u * 0.24, x = W - pad - cw;
    card(x, pad, cw, ch, cr, frozen ? C.frozenFill : C.panel, frozen ? ITEM.glass.color : null);
    text('누적 기록', x + cw - ip, pad + ch * 0.3, u * 0.02, C.muted, 700, 'right');
    monoText(fmt(total), x + cw - ip, pad + ch * 0.68, timeSize, frozen ? ITEM.glass.ink : C.ink, 800, 'right');
  }
  if (itemRun) drawLegend(t);
  drawToast(t);
  // 시간 정지 중엔 화면 테두리를 파랗게
  if (frozen) { ctx.save(); ctx.strokeStyle = ITEM.glass.color; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t / 120); ctx.lineWidth = u * 0.012; ctx.strokeRect(0, 0, W, H); ctx.restore(); }
  if (!connected) text('서버 연결 끊김 - server.js가 켜져 있는지 확인하세요', W / 2, H - pad * 0.6, u * 0.018, C.danger, 700);
}

// 아이템 아이콘: 흰 원 + 아이템 색 테두리
function itemBadge(k, x, y, r) {
  const I = ITEM[k];
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = C.badgeFill; ctx.fill();
  ctx.fillStyle = I.color + '33'; ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.14); ctx.strokeStyle = I.color; ctx.stroke();
  emoji(I.icon, x, y + r * 0.04, r * 1.2);
}

// 아이템전 범례: 왼쪽 아래에 항상 표시 (먹으면 그 줄이 반짝)
function drawLegend(t) {
  const u = L.u, pad = L.pad;
  const { x, y, w, h, ip, rowH, headH } = L.leg;
  card(x, y, w, h, u * 0.022);
  text('🎁 아이템', x + ip, y + ip * 0.4 + headH / 2, u * 0.022, C.ink, 800, 'left');
  text('먹으면', x + w - ip, y + ip * 0.4 + headH / 2, u * 0.017, C.muted, 600, 'right');
  ITEM_KEYS.forEach((k, i) => {
    const I = ITEM[k];
    const ry = y + ip * 0.4 + headH + rowH * (i + 0.5);
    const fk = legendFlash[k] ? (t - legendFlash[k]) / 1500 : 1;
    if (fk < 1) {
      ctx.globalAlpha = (1 - fk) * 0.9;
      rr(x + ip * 0.4, ry - rowH * 0.46, w - ip * 0.8, rowH * 0.92, rowH * 0.3); ctx.fillStyle = I.color + '44'; ctx.fill();
      ctx.globalAlpha = 1;
    }
    itemBadge(k, x + ip + u * 0.02, ry, u * 0.02);
    text(I.desc, x + ip + u * 0.055, ry + 1, u * 0.025, C.ink, 800, 'left');
  });
}

// 아이템 먹었을 때 화면 위쪽에 크게 뜨는 알림
function drawToast(t) {
  if (!itemToast) return;
  const k = (t - itemToast.t0) / 2000;
  if (k >= 1) { itemToast = null; return; }
  const u = L.u, I = ITEM[itemToast.type];
  const msg = `${I.name}!  ${I.desc}`;
  const size = Math.max(u * 0.026, Math.min(u * 0.036, mazeGeom().cs * 0.62));
  ctx.font = `900 ${size}px ${FONT}`;
  const r = size * 0.62;
  const w = ctx.measureText(msg).width + r * 2 + size * 1.6, h = size * 1.9;
  const g = mazeGeom();
  const y = g.oy + g.cs * 0.5; // 미로 맨 윗줄(바깥 벽) 위에 띄워 통로를 덜 가리게
  const pop = k < 0.12 ? easeOut(k / 0.12) : 1;
  const sc = 0.6 + 0.4 * pop + (k < 0.2 ? Math.sin(k / 0.2 * Math.PI) * 0.06 : 0);
  ctx.save();
  ctx.globalAlpha = k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1;
  ctx.translate(W / 2, y); ctx.scale(sc, sc);
  card(-w / 2, -h / 2, w, h, h / 2, C.panel, I.color);
  itemBadge(itemToast.type, -w / 2 + size * 0.5 + r, 0, r);
  text(msg, -w / 2 + size * 0.9 + r * 2, 1, size, I.ink, 900, 'left');
  ctx.restore();
}

function panel(w, h) {
  const x = W / 2 - w / 2, y = H / 2 - h / 2;
  ctx.save();
  ctx.shadowColor = `rgba(${C.shadowRGB},.18)`; ctx.shadowBlur = L.u * 0.04; ctx.shadowOffsetY = L.u * 0.01;
  if (C.cheong) {
    const k = L.u * 0.02;
    rr(x, y, w, h, k); ctx.fillStyle = lacquerFill(y, h); ctx.fill();
    ctx.restore();
    // 옻칠 광택
    ctx.save(); rr(x, y, w, h, k); ctx.clip();
    const gl = ctx.createLinearGradient(0, y, 0, y + L.u * 0.05); gl.addColorStop(0, 'rgba(255,255,255,.07)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(x, y, w, L.u * 0.05); ctx.restore();
    const e = L.u * 0.008;
    rr(x + e, y + e, w - e * 2, h - e * 2, k * 0.7); goldStroke(x, y, w, h, Math.max(1.5, L.u * 0.0025));
    fretCorners(x + e * 2.2, y + e * 2.2, x + w - e * 2.2, y + h - e * 2.2, L.u * 0.045);
    return { x, y, w, h };
  }
  if (C.neon) {
    const k = L.u * 0.03;
    shape(x, y, w, h, k); ctx.fillStyle = neonFill(y, h); ctx.fill();
    ctx.restore();
    shape(x, y, w, h, k); neonStroke(x, y, w, h);
    neonBrackets(x, y, w, h, Math.max(4, Math.min(k * 0.9, w * 0.25, h * 0.35)));
    return { x, y, w, h };
  }
  rr(x, y, w, h, L.u * 0.03); ctx.fillStyle = C.panel; ctx.fill();
  ctx.restore();
  return { x, y, w, h };
}
function dim(a = 0.35) { ctx.fillStyle = `rgba(${C.dimRGB},${a})`; ctx.fillRect(0, 0, W, H); }

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
    ctx.fillStyle = '#0A0F1E'; // QR은 테마와 상관없이 흰 바탕 + 어두운 점 (인식률)
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
  if (usingTunnel) text('📶 Wi-Fi 없이 LTE/5G로도 접속돼요', qx + qs / 2, qy - h * 0.045, u * 0.018, C.good, 700);
  else if (tunnelState === 'starting') text('인터넷 주소 준비 중… (잠시 후 QR이 바뀌어요)', qx + qs / 2, qy - h * 0.045, u * 0.017, C.muted, 600);

  // 오른쪽 안내
  const tx = qx + qs + w * 0.06;
  let y = b.y + h * 0.18;
  text('4인 협동 미로 탈출', tx, y, u * 0.05, C.ink, 800, 'left');
  // 모드 배지 (폰에서 바꿈)
  {
    const isItem = mode === 'item';
    const label = isItem ? '🎁 아이템전' : '일반전';
    ctx.font = `800 ${u * 0.024}px ${FONT}`;
    const bw = ctx.measureText(label).width + u * 0.04, bh = u * 0.045;
    const bx = tx, by = b.y + h * 0.035;
    rr(bx, by, bw, bh, bh / 2); ctx.fillStyle = isItem ? '#FFC83D' : C.track; ctx.fill();
    text(label, bx + bw / 2, by + bh / 2 + 1, u * 0.024, isItem ? '#2B2D42' : C.ink, 800);
    text('← 폰에서 모드·테마를 바꿀 수 있어요', bx + bw + u * 0.015, by + bh / 2 + 1, u * 0.016, C.muted, 600, 'left');
  }
  y += u * 0.06;
  if (mode === 'item') {
    // 아이템전: 부제 자리에 아이템 효과 3개
    let cx = tx;
    for (const k of ITEM_KEYS) {
      itemBadge(k, cx + u * 0.016, y, u * 0.016);
      ctx.font = `800 ${u * 0.02}px ${FONT}`;
      const w = ctx.measureText(ITEM[k].short).width;
      text(ITEM[k].short, cx + u * 0.04, y + 1, u * 0.02, C.ink, 800, 'left');
      cx += u * 0.04 + w + u * 0.025;
    }
  } else text('네 명이 한 캐릭터를 함께 움직여요', tx, y, u * 0.024, C.muted, 600, 'left');
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
  text(`참가 ${n} / 4`, tx, y, u * 0.032, n === 4 ? C.good : C.ink, 800, 'left');
  // 점 4개
  DIRS.forEach((d, i) => {
    ctx.beginPath(); ctx.arc(tx + u * 0.19 + i * u * 0.04, y, u * 0.013, 0, Math.PI * 2);
    ctx.fillStyle = slots[d] ? P[d].color : C.track; ctx.fill();
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
    text(`모두 모였어요! ${Math.max(left, 1)}초 후 시작`, W / 2, b.y + h - h * 0.07, u * 0.026, C.good, 800);
    if (t - lobbyFullAt > 3000) { lobbyFullAt = 0; startRun(); }
  } else lobbyFullAt = 0;
}
let lobbyFullAt = 0;

function drawCountdown(t) {
  const el = t - stateT;
  const u = L.u;
  dim(0.55);
  // 안내 줄: 기믹 + 아이템 (모두 패널 안에)
  const rows = [];
  if (maze.holes && maze.holes.length) rows.push({ icon: '🕳', str: '블랙홀에 들어가면 화이트홀로 나와요' });
  if (maze.ice && maze.ice.size) rows.push({ icon: '🧊', str: '얼음 위에선 쭉 미끄러져요' });
  const itemRun = runMode === 'item';
  const rowH = u * 0.06;
  const topH = u * 0.3;
  const infoH = (rows.length ? rows.length * rowH + u * 0.02 : 0) + (itemRun ? u * 0.055 + ITEM_KEYS.length * rowH : 0);
  const pw = infoH ? u * 0.62 : u * 0.42;
  const b = panel(pw, topH + (infoH ? infoH + u * 0.045 : 0));
  text(`STAGE ${stageIdx + 1} · ${STAGES[stageIdx].name}`, W / 2, b.y + u * 0.06, u * 0.036, C.ink, 800);
  const n = 3 - Math.floor(el / 800);
  const k = (el % 800) / 800;
  const label = n > 0 ? String(n) : '출발!';
  ctx.save();
  ctx.globalAlpha = n > 0 ? 1 - k * 0.6 : 1 - clamp((el - 2400) / 500, 0, 1);
  text(label, W / 2, b.y + u * 0.18, u * (n > 0 ? 0.15 - k * 0.03 : 0.09), n > 0 ? C.ink : C.good, 900);
  ctx.restore();
  if (infoH) {
    let y = b.y + topH;
    ctx.fillStyle = C.line; ctx.fillRect(b.x + u * 0.04, y - u * 0.01, pw - u * 0.08, Math.max(1, u * 0.002));
    const lx = b.x + u * 0.06;
    y += u * 0.025;
    for (const r of rows) {
      y += rowH / 2;
      emoji(r.icon, lx + u * 0.02, y, u * 0.032);
      text(r.str, lx + u * 0.06, y + 1, u * 0.026, C.ink, 800, 'left');
      y += rowH / 2;
    }
    if (itemRun) {
      if (rows.length) y += u * 0.02;
      text('🎁 길에서 살짝 벗어난 아이템, 들렀다 갈까?', lx, y + u * 0.025, u * 0.021, C.muted, 700, 'left');
      y += u * 0.055;
      for (const key of ITEM_KEYS) {
        y += rowH / 2;
        itemBadge(key, lx + u * 0.02, y, u * 0.021);
        text(ITEM[key].desc, lx + u * 0.06, y + 1, u * 0.026, C.ink, 800, 'left');
        y += rowH / 2;
      }
    }
  }
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
  text(fmt(stageTimes[stageTimes.length - 1]), W / 2, b.y + b.h * 0.62, u * 0.06, C.good, 800);
  text(stageIdx + 1 < STAGES.length ? '다음 스테이지 준비…' : '결과 보러 가는 중…', W / 2, b.y + b.h * 0.86, u * 0.02, C.muted, 600);
  if (el > 3200) nextStage();
}

function drawResult(t) {
  const el = t - stateT, u = L.u;
  dim(0.6);
  const w = Math.min(W * 0.8, u * 1.1), h = Math.min(H * 0.82, u * 0.8);
  const b = panel(w, h);
  let y = b.y + h * 0.1;
  text(runMode === 'item' ? '🎉 아이템전 탈출! 🎉' : '🎉 모든 미로 탈출! 🎉', W / 2, y, u * 0.05, C.ink, 800);
  const total = stageTimes.reduce((a, c) => a + c, 0);
  y += h * 0.13;
  text(fmt(total), W / 2, y, u * 0.075, C.good, 900);
  y += h * 0.08;
  let recLine = newRecord ? '★ 최고 기록! ★' : `최고 기록 ${fmt(bestTotal)}`;
  if (runMode === 'item') recLine += runItems.count
    ? `   ·   🎁 아이템 ${runItems.count}개로 ${(runItems.saved / 1000).toFixed(1)}초 단축`
    : '   ·   🎁 아이템을 하나도 안 먹었어요';
  text(recLine, W / 2, y, u * 0.022, newRecord ? C.record : C.muted, 800);

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
    rr(W / 2 - barW / 2, ry - rowH * 0.28, barW, rowH * 0.56, rowH * 0.28); ctx.fillStyle = C.track; ctx.fill();
    const bw = Math.max(rowH * 0.56, barW * (s.moves / maxM) * k);
    rr(W / 2 - barW / 2, ry - rowH * 0.28, bw, rowH * 0.56, rowH * 0.28); ctx.fillStyle = P[d].color; ctx.fill();
    text(s.bot ? `${s.moves}칸 · 🤖 도우미` : `${s.moves}칸 · 벽꿍 ${s.bumps}`, W / 2 + barW / 2 + u * 0.02, ry, u * 0.018, C.muted, 700, 'left');
  });

  if (el > 4000) {
    const a = 0.5 + 0.5 * Math.sin(t / 300);
    ctx.globalAlpha = 0.5 + a * 0.5;
    text('아무나 폰을 흔들면 다시 도전!  (Enter)', W / 2, b.y + h - h * 0.06, u * 0.022, C.ink, 700);
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
    c.poked = Math.max(0, (c.poked || 0) - dt / 1800);
  }
  // 이동 처리 (애니메이션 중이면 대기열에서 하나씩)
  if (state === 'play' && char.hole && t >= char.hole.at) exitHole(t);
  if (state === 'play' && char.boost && t >= char.boost.next) boostStep(t);
  if (state === 'play' && queue.length && (!char.t0 || t - char.t0 >= (char.dur || MOVE_MS)) && !char.bump && !char.boost && !char.hole) {
    stepChar(queue.shift());
  }
  if (state === 'play') updateBots(t);
  // 전시용: 결과 화면에서 오래 방치되면 자리 비우고 처음으로
  if (state === 'result' && t - stateT > 45000 && t - lastActivity > 45000) { post('/reset'); toLobby(); }

  drawBackground(t);
  const g = drawMaze(t);
  drawGimmicks(t, g);
  drawItems(t, g);
  drawChar(t, g);
  drawPopups(t, g);
  for (const d of DIRS) drawCard(d, t);
  if (state !== 'lobby' && state !== 'result') drawHUD(t);
  if (state === 'lobby') drawLobby(t);
  else if (state === 'countdown') drawCountdown(t);
  else if (state === 'clear') drawClear(t);
  else if (state === 'result') drawResult(t);
  drawParticles();
  drawScreenFrame();
  requestAnimationFrame(frame);
}

themeReady = true;
layout();
loadStage(0);
connect();
setState('lobby');
requestAnimationFrame(frame);
