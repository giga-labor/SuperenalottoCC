$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $root
$cardsIndex = Join-Path $projectRoot 'data\cards-index.json'
$watchDirs = @(
  Join-Path $projectRoot 'pages\algoritmi',
  Join-Path $projectRoot 'pages\storico-estrazioni'
)

function Get-CardFiles {
  $files = @()
  foreach ($dir in $watchDirs) {
    if (Test-Path $dir) {
      $files += Get-ChildItem -Path $dir -Recurse -Filter 'card.json' -File -ErrorAction SilentlyContinue
    }
  }
  return $files
}

function Get-State {
  $state = @{}
  foreach ($file in Get-CardFiles) {
    $state[$file.FullName] = $file.LastWriteTimeUtc.Ticks
  }
  return $state
}

$lastState = Get-State
while ($true) {
  Start-Sleep -Milliseconds 750
  $currentState = Get-State
  if ($currentState.Count -eq 0) {
    continue
  }
  $changed = $false
  foreach ($key in $currentState.Keys) {
    if (-not $lastState.ContainsKey($key) -or $lastState[$key] -ne $currentState[$key]) {
      $changed = $true
      break
    }
  }
  if (-not $changed -and $lastState.Count -ne $currentState.Count) {
    $changed = $true
  }
  if ($changed) {
    & python (Join-Path $projectRoot 'scripts\build-cards-index.py') | Out-Null
    $lastState = $currentState
  }
}
