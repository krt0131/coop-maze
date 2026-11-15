# 4인 협동 미로 탈출

네 명이 **캐릭터 하나**를 함께 움직이는 협동 미로 게임입니다.
각자 폰으로 게임 화면의 QR을 찍고 **위 / 오른쪽 / 아래 / 왼쪽 중 한 방향**을 맡아, 폰을 흔들어(또는 자기 방향으로 화면을 밀어) 캐릭터를 한 칸씩 움직입니다.

- 앱 설치 없이 폰 브라우저로 참가 (iOS / Android)
- 4명이 안 되면 빈 방향은 🤖 도우미 봇이 대신 맡음 (혼자서도 플레이 가능)
- 스테이지 3개(쉬움 · 보통 · 어려움, 난이도마다 맵 6개 중 무작위 + 판마다 벽을 무작위로 뚫어 출구까지 길이 여러 갈래), 클리어 시간과 각자 이동 칸수 기록
- 미로 기믹: 🕳 블랙홀 → ⚪ 화이트홀 순간이동, 🧊 얼음 미끄러짐 (스테이지가 올라갈수록 하나씩)
- 📳 콕 찌르기: 폰 버튼으로 다른 방향 담당 폰을 진동시켜 "네 차례야!"
- 🎁 아이템전 모드: 길에서 살짝 벗어난 곳의 ⭐ −4초 · ⏳ 2초 정지 · 🚀 5칸 부스트, 들렀다 갈지 고민하기
- 인터넷 터널(Cloudflare, 무료)로 같은 Wi-Fi가 아니어도 LTE/5G로 접속 가능
- 외부 패키지 없이 Node.js만으로 실행

## 실행 방법 (Windows)

1. [Node.js](https://nodejs.org/) 설치
2. (선택) 같은 Wi-Fi 없이 접속하려면 Cloudflare 터널 프로그램을 `tools/cloudflared.exe`로 받기
   ```
   curl -L -o tools/cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
   ```
   없으면 폰과 PC가 같은 Wi-Fi에 있을 때만 접속됩니다.
3. `게임실행.bat` 더블클릭 → 게임 화면이 열리면 폰으로 QR 찍기
4. 끝낼 때는 `게임종료.bat`

> GitHub Pages로는 실행되지 않습니다. 폰과 게임 화면을 연결하는 서버(`server.js`)가 PC에서 돌아가야 해요.

자세한 운영 방법(키보드 단축키, 문제 해결)은 [사용법.md](사용법.md)를 보세요.

## 구조

| 파일 | 역할 |
|---|---|
| `server.js` | 로컬 서버: 게임 화면·폰 화면 제공, 자리 배정, 인터넷 터널 자동 실행 |
| `public/index.html`, `public/game.js` | 게임 화면 (캔버스 2D, 미로·도우미 봇·결과 화면) |
| `public/pad.html` | 폰 조작 화면 (방향 선택, 흔들기·드래그 판정) |
| `public/vendor/qrcode.js` | QR 생성 라이브러리 ([qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), MIT) |
| `tools/stop.ps1` | 게임 서버와 터널만 골라서 종료 |
