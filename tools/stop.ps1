# 게임 서버 + 인터넷 터널만 골라서 종료 (다른 node 작업은 건드리지 않음)
param([int]$Port = 3000)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$gameDir  = Split-Path -Parent $PSScriptRoot
$toolsDir = Join-Path $gameDir 'tools'
$stopped = 0

# 1) 게임 포트를 쓰고 있는 node server.js
$conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conns) {
  $p = Get-CimInstance Win32_Process -Filter "ProcessId=$($c.OwningProcess)"
  if ($p -and $p.Name -eq 'node.exe' -and $p.CommandLine -match 'server\.js') {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "게임 서버를 껐어요 (pid $($p.ProcessId))"
    $stopped++
  } elseif ($p) {
    Write-Host "$Port 번 포트를 다른 프로그램($($p.Name))이 쓰고 있어서 건드리지 않았어요."
  }
}

# 2) 이 폴더 tools 안의 cloudflared (터널)
Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" | Where-Object {
  $_.ExecutablePath -and $_.ExecutablePath.StartsWith($toolsDir, [System.StringComparison]::OrdinalIgnoreCase)
} | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  Write-Host "인터넷 터널을 껐어요 (pid $($_.ProcessId))"
  $stopped++
}

if ($stopped -eq 0) { Write-Host "켜져 있는 게임 서버가 없어요. (이미 꺼져 있음)" }
else { Write-Host ""; Write-Host "종료 완료! 브라우저의 게임 탭은 닫아도 돼요." }
