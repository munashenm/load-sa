# Installs git post-commit hook to push to GitHub after each commit
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (Test-Path "$PSScriptRoot\..\prisma") {
  $repoRoot = Resolve-Path "$PSScriptRoot\.."
} else {
  $repoRoot = Get-Location
}

$hookSrc = Join-Path $PSScriptRoot "git-hooks\post-commit"
$hookDest = Join-Path $repoRoot ".git\hooks\post-commit"

if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
  Write-Host "Not a git repo. Run: git init" -ForegroundColor Red
  exit 1
}

Copy-Item $hookSrc $hookDest -Force
Write-Host "Installed auto-push hook -> $hookDest" -ForegroundColor Green
Write-Host "After each 'git commit', changes push to origin automatically."
