# dev-bootstrap.ps1
#
# Brings the whole Conduit stack up from a cold machine:
#   1. Start the Postgres container (docker-compose.yml)
#   2. Wait for Postgres to accept connections
#   3. Create the development database if it does not already exist
#   4. Run pending migrations
#   5. Seed dummy data when the database is empty (so repeat runs do not duplicate rows)
#   6. Start the backend (tsx watch) + frontend (Vite) dev servers
#
# Intended to be launched by a Scheduled Task at logon, but also runnable manually:
#   powershell -ExecutionPolicy Bypass -File .\scripts\dev-bootstrap.ps1

$ErrorActionPreference = "Stop"

# Always run from the repo root (this file's parent's parent).
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# 1. Postgres container ---------------------------------------------------------
Write-Host "==> Starting Postgres container..."
docker compose up -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed ($LASTEXITCODE)" }

# 2. Wait for readiness ---------------------------------------------------------
Write-Host "==> Waiting for Postgres to accept connections..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    docker exec conduit-full-postgres pg_isready -U postgres 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 2
}
if (-not $ready) { throw "Postgres did not become ready in time" }

# 3. Create database (idempotent: ignored if it already exists) ------------------
Write-Host "==> Ensuring development database exists..."
yarn sqlz db:create 2>&1 | Out-Null

# 4. Migrate --------------------------------------------------------------------
Write-Host "==> Running migrations..."
yarn sqlz db:migrate
if ($LASTEXITCODE -ne 0) { throw "migrations failed ($LASTEXITCODE)" }

# 5. Seed only when the database is empty ---------------------------------------
$userCount = 0
try {
    $raw = docker exec conduit-full-postgres psql -U postgres -d conduit_development -tAc 'SELECT COUNT(*) FROM "Users";' 2>$null
    $userCount = [int]($raw.Trim())
} catch {
    $userCount = 0
}
if ($userCount -eq 0) {
    Write-Host "==> Database is empty; seeding dummy data..."
    yarn sqlz db:seed:all
    if ($LASTEXITCODE -ne 0) { throw "seeding failed ($LASTEXITCODE)" }
} else {
    Write-Host "==> Database already has $userCount user(s); skipping seed."
}

# 6. Dev servers ----------------------------------------------------------------
Write-Host "==> Starting backend + frontend dev servers..."
yarn dev