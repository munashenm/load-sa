# Plan B: seed using DATABASE_URL from .env (no Railway CLI)
# 1) Railway -> Postgres service -> Variables -> copy DATABASE_URL
# 2) Railway -> App -> Variables -> paste same DATABASE_URL (if not referenced)
# 3) Save as .env in zim-sa-delivery:
#      DATABASE_URL=postgresql://...
#      SESSION_SECRET=anything-for-local-seed
# 4) Run: .\scripts\seed-from-env.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".env")) {
  Write-Host "Create .env with DATABASE_URL copied from Railway Postgres." -ForegroundColor Red
  exit 1
}

Write-Host "Migrating..." -ForegroundColor Green
npm run db:migrate
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Seeding..." -ForegroundColor Green
npm run db:seed
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nDatabase ready on Railway.`n" -ForegroundColor Cyan
