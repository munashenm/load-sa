# Populate Railway database (migrate + seed)
# Prerequisite: DATABASE_URL linked on your APP service in Railway dashboard
#
# Usage:
#   cd zim-sa-delivery
#   npx @railway/cli login
#   npx @railway/cli link
#   .\scripts\railway-setup.ps1

$ErrorActionPreference = "Stop"
$Railway = "npx"
$RailwayArgs = @("@railway/cli")

Write-Host "`n=== Fluxmove — Railway database setup ===" -ForegroundColor Cyan
Write-Host "Uses: npx @railway/cli (no global install needed)`n"

Write-Host "1/2 Running database migrations..." -ForegroundColor Green
& $Railway @($RailwayArgs + @("run", "npm", "run", "db:migrate"))
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nFAILED." -ForegroundColor Red
  Write-Host "1) Run: npx @railway/cli login"
  Write-Host "2) Run: npx @railway/cli link  (pick your APP service, not Postgres)"
  Write-Host "3) In Railway: app -> Variables -> reference Postgres DATABASE_URL`n"
  exit 1
}

Write-Host "`n2/2 Seeding demo users..." -ForegroundColor Green
& $Railway @($RailwayArgs + @("run", "npm", "run", "db:seed"))
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nDone! Demo logins (password: demo12345):" -ForegroundColor Cyan
Write-Host "  customer@demo.co.za"
Write-Host "  driver@demo.co.za"
Write-Host "  admin@fluxmove.co.za`n"
