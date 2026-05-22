$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$env:DROPREFERENCE_DISCOVERY_PAGES = if ($env:DROPREFERENCE_DISCOVERY_PAGES) { $env:DROPREFERENCE_DISCOVERY_PAGES } else { "75" }
$env:DROPREFERENCE_MAX_GAMES = if ($env:DROPREFERENCE_MAX_GAMES) { $env:DROPREFERENCE_MAX_GAMES } else { "0" }
$env:DROPREFERENCE_DELAY_MS = if ($env:DROPREFERENCE_DELAY_MS) { $env:DROPREFERENCE_DELAY_MS } else { "750" }

$logPath = Join-Path $repoRoot "data\dropreference-import.log"
$summaryPath = Join-Path $repoRoot "data\dropreference-import-summary.json"

function Write-LogLine {
  param([string] $Message)

  Write-Host $Message
  $Message | Out-File -FilePath $logPath -Encoding utf8 -Append
}

function Invoke-LoggedCommand {
  param([string[]] $Command)

  $display = $Command -join " "
  $exe = $Command[0]
  $argsList = @()
  if ($Command.Length -gt 1) {
    $argsList = $Command[1..($Command.Length - 1)]
  }

  Write-LogLine "----- $display -----"
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $exe @argsList 2>&1 | ForEach-Object { Write-LogLine "$_" }
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
  if ($exitCode -ne 0) {
    throw "Command failed with exit code ${exitCode}: $display"
  }
}

Remove-Item -LiteralPath $logPath -Force -ErrorAction SilentlyContinue
Write-LogLine "DropReference import started: $(Get-Date -Format o)"
Write-LogLine "Repo: $repoRoot"
Write-LogLine "DROPREFERENCE_DISCOVERY_PAGES=$env:DROPREFERENCE_DISCOVERY_PAGES"
Write-LogLine "DROPREFERENCE_MAX_GAMES=$env:DROPREFERENCE_MAX_GAMES"
Write-LogLine "DROPREFERENCE_DELAY_MS=$env:DROPREFERENCE_DELAY_MS"

Invoke-LoggedCommand @("node", "scripts\scrape-dropreference-data.mjs")
Invoke-LoggedCommand @("npm.cmd", "run", "build")

node -e @"
const fs = require('fs');
const read = (name) => JSON.parse(fs.readFileSync('data/' + name + '.json', 'utf8'));
const games = read('games');
const gpus = read('gpus');
const benchmarks = read('benchmarks');
const images = read('game-images');
const sources = read('game-sources');
const bySource = sources.reduce((acc, item) => {
  acc[item.source] = (acc[item.source] || 0) + 1;
  return acc;
}, {});
const summary = {
  generatedAt: new Date().toISOString(),
  games: games.length,
  gpus: gpus.length,
  benchmarks: benchmarks.length,
  gamesWithImages: Object.keys(images).length,
  fpsGames: new Set(benchmarks.map((item) => item.gameSlug)).size,
  fpsGpus: new Set(benchmarks.map((item) => item.gpuSlug)).size,
  sourceCounts: bySource,
  latestDropReferenceGames: sources
    .filter((item) => item.source === 'dropreference')
    .slice(-25)
    .map((item) => ({ slug: item.slug, name: item.name, url: item.url })),
};
fs.writeFileSync('data/dropreference-import-summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
"@ 2>&1 | ForEach-Object { Write-LogLine "$_" }
if ($LASTEXITCODE -ne 0) {
  throw "Summary generation failed with exit code ${LASTEXITCODE}"
}

Write-LogLine "DropReference import finished: $(Get-Date -Format o)"
Write-LogLine "Summary: $summaryPath"
