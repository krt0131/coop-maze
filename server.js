// 4인 협동 미로 탈출 - 로컬 서버 (외부 패키지 없음)
//  - public/ 의 게임 화면(/)과 폰 조작 화면(/pad)을 서비스
//  - 폰 → 서버: POST /join, /swipe, /ping, /leave
//  - 서버 → 게임·폰: Server-Sent Events (/events)
//  - 자리(방향) 배정은 서버가 관리

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const TIMEOUT_MS = 20000; // 폰 신호가 이 시간 동안 없으면 자리 해제
const DIRS = ['up', 'right', 'down', 'left'];

const slots = { up: null, right: null, down: null, left: null }; // dir -> pid
const lastSeen = new Map(); // pid -> time
let phase = 'lobby'; // 게임 화면이 알려주는 현재 단계 (폰 표시용)
let mode = 'normal'; // 'normal' 일반전 | 'item' 아이템전 — 폰(참가자)이 대기/결과 화면에서 고름
const clients = new Set();
// 콕 찌르기: 찔린 방향 → { from }. 폰은 /ping 응답으로 받아 감 (터널이 SSE를 버퍼링해서)
const pokes = new Map();
const lastPoke = new Map(); // pid → 마지막으로 찌른 시각 (연타 방지)

// ---------- 인터넷 터널 (Cloudflare 무료 임시 터널) ----------
// tools/cloudflared.exe 가 있으면 자동 실행 → https://xxxx.trycloudflare.com 주소를 받아
// 게임 화면 QR에 사용. 폰은 같은 Wi-Fi가 아니어도(LTE/5G) 접속 가능.
// 끄려면 TUNNEL=0 으로 실행.
const { spawn } = require('child_process');
let tunnelURL = null;
let tunnelState = 'off'; // off | starting | on | failed
let tunnelProc = null;

function startTunnel() {
  if (process.env.TUNNEL === '0') return;
  const exe = path.join(__dirname, 'tools', process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');
  if (!fs.existsSync(exe)) { console.log('[터널] tools/cloudflared.exe 없음 → 같은 Wi-Fi 방식만 사용'); return; }
  tunnelState = 'starting';
  console.log('[터널] 인터넷 주소 만드는 중... (10초 정도 걸려요)');
  // windowsHide를 쓰지 않음 → 서버 창(콘솔)을 같이 쓰므로 서버 창을 닫으면 터널도 함께 꺼짐
  tunnelProc = spawn(exe, ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${PORT}`]);
  const onData = buf => {
    const m = String(buf).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (m && !tunnelURL) {
      tunnelURL = m[0];
      tunnelState = 'on';
      console.log('');
      console.log(`[터널] 연결됨! 폰 주소: ${tunnelURL}/pad  (LTE/5G로도 접속 가능)`);
      console.log('');
      broadcast({ t: 'tunnel', url: tunnelURL, state: tunnelState });
    }
  };
  tunnelProc.stdout.on('data', onData);
  tunnelProc.stderr.on('data', onData);
  tunnelProc.on('exit', code => {
    console.log(`[터널] 종료됨 (code ${code}) → 같은 Wi-Fi 방식으로 계속 사용 가능`);
    tunnelURL = null; tunnelState = 'failed'; tunnelProc = null;
    broadcast({ t: 'tunnel', url: null, state: tunnelState });
  });
  setTimeout(() => {
    if (tunnelState === 'starting') {
      console.log('[터널] 30초 안에 주소를 못 받음 (인터넷 연결 확인) → 같은 Wi-Fi 방식 사용');
      tunnelState = 'failed';
      broadcast({ t: 'tunnel', url: null, state: tunnelState });
    }
  }, 30000);
}
function stopTunnel() { if (tunnelProc) { try { tunnelProc.kill(); } catch (e) {} } }
process.on('exit', stopTunnel);
process.on('SIGINT', () => { stopTunnel(); process.exit(0); });
process.on('SIGTERM', () => { stopTunnel(); process.exit(0); });

// ---------- 보안: 운영자 전용 요청 구분 ----------
const ADMIN_ONLY = new Set(['/reset', '/phase', '/sim', '/shutdown']);
function isLocalAdmin(req) {
  const ip = req.socket.remoteAddress || '';
  const loopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  const viaTunnel = !!(req.headers['cf-connecting-ip'] || req.headers['cf-ray']);
  return loopback && !viaTunnel;
}

function send(res, obj) { res.write(`data: ${JSON.stringify(obj)}\n\n`); }
function broadcast(obj) { for (const c of clients) send(c, obj); }
function slotsMsg() { return { t: 'slots', slots, phase, mode }; }
function slotOf(pid) { return DIRS.find(d => slots[d] === pid) || null; }

function release(pid) {
  const d = slotOf(pid);
  if (d) { slots[d] = null; broadcast(slotsMsg()); }
}

setInterval(() => {
  const now = Date.now();
  for (const d of DIRS) {
    const pid = slots[d];
    if (pid && now - (lastSeen.get(pid) || 0) > TIMEOUT_MS) {
      slots[d] = null;
      console.log(`[해제] ${d} 담당 신호 끊김`);
      broadcast(slotsMsg());
    }
  }
}, 2000);

function localIPs() {
  const ips = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const n of list || []) {
      if (n.family === 'IPv4' && !n.internal) ips.push({ ip: n.address, name });
    }
  }
  // 일반 공유기/와이파이 대역을 먼저, 가상 어댑터는 뒤로
  const score = ({ ip, name }) => {
    let s = 0;
    if (/^192\.168\./.test(ip)) s += 3;
    else if (/^10\./.test(ip)) s += 2;
    else if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) s += 1;
    if (/wi-?fi|wlan|무선|ethernet|이더넷/i.test(name)) s += 2;
    if (/vEthernet|virtual|vmware|virtualbox|hyper-v|wsl|docker|loopback|bluetooth/i.test(name)) s -= 5;
    return -s;
  };
  return ips.sort((a, b) => score(a) - score(b)).map(x => x.ip);
}

function readBody(req, cb) {
  let body = '';
  req.on('data', c => { body += c; if (body.length > 4000) req.destroy(); });
  req.on('end', () => { try { cb(JSON.parse(body || '{}')); } catch (e) { cb({}); } });
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (p === '/events') {
    // X-Accel-Buffering / 초기 패딩: 터널(프록시)을 거쳐도 이벤트가 바로바로 전달되게
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write(`: ${' '.repeat(2048)}\n\n`);
    clients.add(res);
    send(res, slotsMsg());
    const keep = setInterval(() => res.write(': keep\n\n'), 15000);
    req.on('close', () => { clients.delete(res); clearInterval(keep); });
    return;
  }

  if (p === '/info') return json(res, 200, { ips: localIPs(), port: PORT, tunnel: tunnelURL, tunnelState });

  // 운영자 전용 기능(자리 초기화·게임 단계 알림)은 이 PC에서 연 게임 화면만 사용 가능.
  // 인터넷 터널로 들어온 요청은 cloudflared가 127.0.0.1에서 전달하지만 cf-* 헤더가 붙어 있어 구분됨.
  if (req.method === 'POST' && ADMIN_ONLY.has(p) && !isLocalAdmin(req)) {
    return json(res, 403, { ok: false, reason: 'admin-only' });
  }

  if (req.method === 'POST') {
    return readBody(req, m => {
      const pid = typeof m.pid === 'string' ? m.pid.slice(0, 40) : null;

      if (p === '/join') {
        if (!pid || !DIRS.includes(m.dir)) return json(res, 400, { ok: false });
        lastSeen.set(pid, Date.now());
        const mine = slotOf(pid);
        if (mine === m.dir) return json(res, 200, { ok: true, dir: mine });
        if (slots[m.dir]) return json(res, 409, { ok: false, reason: 'taken' });
        if (mine) slots[mine] = null;
        slots[m.dir] = pid;
        console.log(`[참가] ${m.dir} 담당 입장`);
        broadcast(slotsMsg());
        return json(res, 200, { ok: true, dir: m.dir });
      }

      if (p === '/swipe') {
        if (!pid) return json(res, 400, { ok: false });
        lastSeen.set(pid, Date.now());
        const mine = slotOf(pid);
        if (!mine) return json(res, 200, { ok: false, reason: 'noslot' });
        if (DIRS.includes(m.dir)) broadcast({ t: 'swipe', slot: mine, dir: m.dir });
        return json(res, 200, { ok: true });
      }

      if (p === '/ping') {
        if (pid) lastSeen.set(pid, Date.now());
        // 폰은 SSE 대신 이 응답으로 상태를 받음 (인터넷 터널은 SSE를 버퍼링해서)
        const me = pid ? slotOf(pid) : null;
        let poke = null;
        if (me && pokes.has(me)) { poke = pokes.get(me); pokes.delete(me); if (Date.now() - poke.at > 6000) poke = null; }
        return json(res, 200, { ok: true, dir: me, slots, phase, mode, poke: poke && { from: poke.from } });
      }

      // 폰의 '지금 시작' 버튼 (빈 자리는 게임 화면의 도우미 봇이 맡음)
      if (p === '/start') {
        if (pid) lastSeen.set(pid, Date.now());
        if (!pid || !slotOf(pid)) return json(res, 200, { ok: false, reason: 'noslot' });
        if (phase !== 'lobby' && phase !== 'result') return json(res, 200, { ok: false, reason: 'playing' });
        broadcast({ t: 'start', by: slotOf(pid) });
        return json(res, 200, { ok: true });
      }

      // 모드 바꾸기 (일반전/아이템전): 참가자 폰 또는 이 PC의 게임 화면(M키), 게임 중엔 불가
      if (p === '/mode') {
        if (pid) lastSeen.set(pid, Date.now());
        if (!(pid && slotOf(pid)) && !isLocalAdmin(req)) return json(res, 200, { ok: false, reason: 'noslot' });
        if (m.mode !== 'normal' && m.mode !== 'item') return json(res, 400, { ok: false });
        if (phase !== 'lobby' && phase !== 'result') return json(res, 200, { ok: false, reason: 'playing', mode });
        if (mode !== m.mode) { mode = m.mode; console.log(`[모드] ${mode === 'item' ? '아이템전' : '일반전'}`); broadcast(slotsMsg()); }
        return json(res, 200, { ok: true, mode });
      }

      // 콕 찌르기: 다른 방향 담당 폰을 진동시키고 게임 화면 카드도 흔들기
      if (p === '/poke') {
        if (pid) lastSeen.set(pid, Date.now());
        const me = pid ? slotOf(pid) : null;
        if (!me || !DIRS.includes(m.to) || m.to === me) return json(res, 200, { ok: false });
        if (Date.now() - (lastPoke.get(pid) || 0) < 700) return json(res, 200, { ok: false, reason: 'tooFast' });
        lastPoke.set(pid, Date.now());
        if (slots[m.to]) pokes.set(m.to, { from: me, at: Date.now() });
        broadcast({ t: 'poke', from: me, to: m.to });
        return json(res, 200, { ok: true, bot: !slots[m.to] });
      }

      if (p === '/leave') {
        if (pid) release(pid);
        return json(res, 200, { ok: true });
      }

      // 게임 화면 → 서버
      if (p === '/phase') {
        if (typeof m.phase === 'string') { phase = m.phase.slice(0, 20); broadcast(slotsMsg()); }
        return json(res, 200, { ok: true });
      }
      // 게임 화면 ⚙ 설정의 '게임 종료' 버튼 (이 PC에서만 가능)
      if (p === '/shutdown') {
        console.log('[종료] 게임 화면에서 종료 요청 → 서버와 터널을 끕니다.');
        broadcast({ t: 'shutdown' });
        json(res, 200, { ok: true });
        setTimeout(() => { stopTunnel(); process.exit(0); }, 400);
        return;
      }
      if (p === '/reset') {
        for (const d of DIRS) slots[d] = null;
        phase = 'lobby';
        console.log('[초기화] 자리 배정 초기화');
        broadcast({ t: 'reset' });
        broadcast(slotsMsg());
        return json(res, 200, { ok: true });
      }

      // 키보드 테스트용: 게임 화면이 직접 swipe를 흉내낼 때
      if (p === '/sim') {
        if (DIRS.includes(m.slot) && DIRS.includes(m.dir)) broadcast({ t: 'swipe', slot: m.slot, dir: m.dir, sim: true });
        return json(res, 200, { ok: true });
      }

      return json(res, 404, { ok: false });
    });
  }

  const rel = p === '/' ? '/index.html' : p === '/pad' ? '/pad.html' : p;
  const file = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(rel)));
  // public 폴더 바깥 파일은 절대 내보내지 않음 (예: ../server.js, ../public2/...)
  if (file !== PUBLIC_DIR && !file.startsWith(PUBLIC_DIR + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.listen(PORT, () => { // 호스트 미지정 = IPv4/IPv6 모두 수신 (localhost가 ::1로 풀려도 접속됨)
  const ips = localIPs();
  console.log('');
  console.log('==============================================');
  console.log('  4인 협동 미로 탈출 - 서버 실행 중');
  console.log('==============================================');
  console.log(`  게임 화면 (이 PC 브라우저): http://localhost:${PORT}`);
  console.log(`  같은 Wi-Fi용 폰 주소: http://${ips[0] || 'PC-IP'}:${PORT}/pad`);
  if (ips.length > 1) console.log(`  다른 IP 후보: ${ips.slice(1).join(', ')}`);
  console.log('');
  console.log('  * 인터넷 터널이 연결되면 QR이 자동으로 인터넷 주소로 바뀌어요 (LTE 접속 가능).');
  console.log('  * 터널이 안 되면 폰과 PC가 같은 Wi-Fi에 있어야 합니다.');
  console.log('  * 처음 실행 시 Windows 방화벽 창이 뜨면 "허용"을 눌러주세요.');
  console.log('  종료: 게임종료.bat 실행, 또는 이 창 닫기');
  console.log('==============================================');
  console.log('');
  startTunnel();
});

server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.log('');
    console.log(`[오류] ${PORT}번 포트를 이미 다른 프로그램이 쓰고 있어요.`);
    console.log('  - 게임 서버 창이 이미 하나 켜져 있는지 확인하고 닫아주세요.');
    console.log('  - 그래도 안 되면 게임종료.bat 을 실행한 뒤 다시 켜주세요.');
    console.log('');
  } else console.error('[오류]', e.message);
  process.exit(1);
});
