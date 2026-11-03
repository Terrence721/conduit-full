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

param([switch]$EnvOnly)

$ErrorActionPreference = "Stop"

# Always run from the repo root (this file's parent's parent).
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# 1. Postgres container ---------------------------------------------------------
Write-Host "==> Starting Postgres container..."
docker compose up -d postgres
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
# "db:create" exits non-zero when the DB already exists; that is expected.
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
yarn sqlz db:create 2>&1 | Out-Null
$ErrorActionPreference = $previousPreference
if ($LASTEXITCODE -ne 0) { Write-Host "    (DB already exists; continuing)" }

# 4. Migrate --------------------------------------------------------------------
Write-Host "==> Running migrations..."
$migrateOutput = yarn sqlz db:migrate 2>&1
Write-Host $migrateOutput
if ($LASTEXITCODE -ne 0) { throw "migrations failed ($LASTEXITCODE)" }

# 5. Seed only on the first run ---------------------------------------------------
# Checking the Users table directly is unreliable across shells and container
# timing, so a marker file records that seeding has already happened. Delete
# ".seeded" if you drop/recreate the database and want a fresh seed.
$seedMarker = Join-Path $repoRoot ".seeded"
if (-not (Test-Path $seedMarker)) {
    Write-Host "==> First run; seeding dummy data..."
    yarn sqlz db:seed:all
    if ($LASTEXITCODE -ne 0) { throw "seeding failed ($LASTEXITCODE)" }
    New-Item -ItemType File -Path $seedMarker | Out-Null
} else {
    Write-Host "==> Already seeded (marker present); skipping seed."
}

if ($EnvOnly) {
    Write-Host "==> Environment ready (dev servers not started)."
    exit 0
}

# 6. Dev servers ----------------------------------------------------------------
Write-Host "==> Starting backend + frontend dev servers..."
yarn dev