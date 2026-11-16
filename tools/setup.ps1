# 게임실행.bat이 처음에 부르는 준비 스크립트
# 1) Node.js 없으면 winget으로 자동 설치 (안 되면 설치 안내)
# 2) tools/cloudflared.exe 없으면 Cloudflare 공식 배포처에서 자동으로 받기 (실패해도 같은 Wi-Fi 방식으로는 실행 가능)
param([string]$ToolsDir = $PSScriptRoot)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}

# ---------- 1) Node.js ----------
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js가 없어서 자동으로 설치할게요. (1~2분, 설치 허용 창이 뜨면 '예')"
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    Refresh-Path
  }
  if (-not (Get-Command node -ErrorAction SilentlyContinue) -and -not (Test-Path "$env:ProgramFiles\nodejs\node.exe")) {
    Write-Host ""
    Write-Host "Node.js 자동 설치에 실패했어요."
    Write-Host "https://nodejs.org 에서 LTS 버전을 설치한 뒤 게임실행.bat을 다시 실행해 주세요."
    Start-Process "https://nodejs.org"
    exit 1
  }
  Write-Host "Node.js 설치 완료!"
}

# ---------- 2) 인터넷 터널 프로그램 ----------
$exe = Join-Path $ToolsDir 'cloudflared.exe'
if (-not (Test-Path $exe)) {
  Write-Host "인터넷 터널 프로그램(cloudflared)을 받는 중... (처음 한 번만, 약 60MB)"
  $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } elseif ([Environment]::Is64BitOperatingSystem) { 'amd64' } else { '386' }
  $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-$arch.exe"
  $tmp = "$exe.download"
  try {
    Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing
    Move-Item -Force $tmp $exe
    Write-Host "받기 완료! 같은 Wi-Fi가 아니어도(LTE/5G) 접속할 수 있어요."
  } catch {
    Remove-Item -Force $tmp -ErrorAction SilentlyContinue
    Write-Host "터널 프로그램을 받지 못했어요 (인터넷 확인). 폰을 PC와 같은 Wi-Fi에 연결하면 그대로 플레이할 수 있어요."
  }
}
exit 0
