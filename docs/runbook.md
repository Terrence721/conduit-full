# Release Runbook

This runbook covers deploying and operating the Conduit full stack.

## Prerequisites

- PostgreSQL instance (managed or containerized) reachable from the app.
- A secrets manager / environment providing at minimum:
  - `JWT_KEY`
  - `CORS_ORIGIN`
  - `PROD_DB_USERNAME`
  - `PROD_DB_PASSWORD`
  - `PROD_DB_NAME`
  - `PROD_DB_HOSTNAME`
  - `PROD_DB_PORT`
  - `PROD_DB_DIALECT` (`postgres`)
  - Optional: `PROD_DB_SSL=true` for managed Postgres requiring TLS.
- A container registry (GHCR is configured in CI) for the built image.

Production mode refuses to boot when `JWT_KEY`, `CORS_ORIGIN`, or any
`PROD_DB_*` value is missing or still a placeholder.

## Deploy

1. Ensure CI is green on `main` (lint, typecheck, tests, E2E, Docker build).
2. The `publish` job builds and pushes `ghcr.io/<repo>:<sha>` and `:latest`.
3. Roll the application host to the new image tag.
4. On container start, the entrypoint runs:
   ```
   yarn sqlz db:migrate && exec node backend/dist/index.js
   ```
   A failed migration aborts startup. Database connections use TLS when
   `PROD_DB_SSL=true`.

## Post-deploy smoke checks

- `GET /healthz` returns `200` with `{ status: "ok" }`.
- `GET /readyz` returns `200` with `{ status: "ready" }` (verifies DB connectivity).
- Load `/` (the SPA) and confirm deep links (`/home`, `/article/:slug`) resolve.
- `GET /metrics` returns Prometheus text with `conduit_http_requests_total`.
- Register / log in and create an article (covers auth + DB writes).

## Rollback

1. Re-point the host at the previous image tag.
2. Do **not** automatically roll back the database. Migrations are additive;
   if a migration must be reverted, run the corresponding `db:migrate:undo`
   deliberately and re-verify `readyz`.
3. Redeploy the previous image and re-run smoke checks.

## Key endpoints

| Endpoint            | Purpose                     |
| ------------------- | --------------------------- |
| `GET /healthz`      | Liveness probe              |
| `GET /readyz`       | Readiness (DB connectivity) |
| `GET /metrics`      | Prometheus counters         |
| `GET /openapi.yaml` | OpenAPI 3 spec              |
| `GET /api-docs`     | Swagger UI                  |

## Operations notes

- Rate limits: 100 requests / 15 min globally, 10 / 15 min on login.
- Set `TRUST_PROXY=1` (or more) when behind a reverse proxy/load balancer.
- `X-Request-Id` is echoed on responses; structured access logs include
  request id, method, path, status, and duration.
- Dummy seed data is development-only; production never runs `db:seed:all`.
- Optional Sentry error reporting: set `SENTRY_DSN` (and install `@sentry/node`) to capture unhandled errors; unset by default.
- CORS origins are env-driven in production (`CORS_ORIGIN`, comma-separated).
