# 📝 Conduit — RealWorld Example App (Modernized Fork)

[![Quality](https://github.com/Terrence721/conduit-full/actions/workflows/quality.yml/badge.svg)](https://github.com/Terrence721/conduit-full/actions/workflows/quality.yml)
[![CodeQL](https://github.com/Terrence721/conduit-full/actions/workflows/codeql.yml/badge.svg)](https://github.com/Terrence721/conduit-full/actions/workflows/codeql.yml)

**[📜 View the portfolio page →](https://terrence721.github.io/conduit-full/portfolio.html)**

Last updated: September 1, 2026

This repository is an independently modernized fork of the RealWorld **Conduit** example app — a Medium-style publishing platform (CRUD, JWT auth, pagination) built with **React 19 / Vite + SWC / Express 5 / Sequelize / PostgreSQL**. It's not affiliated with the RealWorld project or the original repo author.

Rather than copying the source app over wholesale, this fork is being rebuilt one file at a time: each file is re-added deliberately, with dependencies and patterns brought up to their current latest versions along the way, and every real bug fixed via a real failing test — not read twice and assumed fine.

**At a glance:** 214/214 backend tests passing, 8/8 frontend tests passing, 0 open CodeQL alerts, 61 real bugs found and fixed — see the Quality/CodeQL badges above for live CI status. **Milestone: the full stack runs end to end.** Every planned frontend layer (services → context → components → route pages → `App.tsx`/`main.tsx`) is now built and wired, and the whole thing has been verified live — a real Postgres database, migrated and seeded, backing a running `yarn dev` session with actual articles, profiles, and comments rendering in a browser. **Known gap:** the 50 files tracked by [issue #71](https://github.com/Terrence721/conduit-full/issues/71) have zero behavioral test coverage yet (typecheck+lint+`/simplify` only) — tracked openly, not hidden.

## 🧭 Start Here

- **[System Architecture](https://terrence721.github.io/conduit-full/diagrams/system-architecture.html)** — the dev-proxy → Express → Postgres request path, and where the frontend fits
- **[Auth & Request Flow](https://terrence721.github.io/conduit-full/diagrams/auth-flow.html)** — how `verifyToken`'s soft-auth-by-default pattern actually works, and the real bug it's responsible for
- **[Data Model](https://terrence721.github.io/conduit-full/diagrams/data-model.html)** — the 4 models and 6 associations, and the two real FK bugs migrations now catch
- **[Testing Strategy](https://terrence721.github.io/conduit-full/diagrams/testing-strategy.html)** — the four test layers this repo runs, real in-memory SQLite instead of hand-stubbed mocks

The rest of the [wiki](https://github.com/Terrence721/conduit-full/wiki) goes deeper per backend module.

- **[`todo.md`](todo.md)** — the primary, detailed record: a phase-by-phase written log of everything done and everything still open, with dates and the reasoning behind each decision. This is the source of truth.
- **[GitHub Project board](https://github.com/users/Terrence721/projects/4)** — a Scrum-style Backlog/Planned/In Progress/Verification & QA/Done view of the same work, for a quick at-a-glance status without reading the full log. Kept in sync with [`todo.md`](todo.md).

On AI-assisted development: this repo is built with Claude Code, directed, reviewed, and merged by Terrence Daniels for every change — see [`todo.md`](todo.md) for the file-by-file record of that review.

## 🧭 Why This Matters

RealWorld's Conduit is a well-known "same app, N stacks" demo, useful precisely because it's common ground — but reference implementations age: pinned dependencies, no TypeScript, no CI, no tests, a schema that only worked because `sequelize.sync({ alter: true })` quietly patched it at boot. The point of this repo is doing the unglamorous work of actually modernizing one, file by file, with the reasoning for every real decision written down as it happened.

## 🏗 What's Here So Far

```text
  backend/            Express 5 + Sequelize 6 + PostgreSQL, 100% TypeScript   ✅ done
  frontend/config     package.json, tsconfig, vite.config, index.html        ✅ done
  frontend/helpers    dateFormatter, errorHandler                            ✅ done
  frontend/types      Profile, Article, Comment, User, AuthState, + more     ✅ done
  frontend/services   all 16 planned API service modules                    ✅ done
  frontend/context    AuthContext, FeedContext                              ✅ done
  frontend/components 31 of 31, see todo.md for the list                    ✅ done
  frontend/routes     10 of 10 route pages                                  ✅ done
  frontend/App+main   entry point, wires the router and every route         ✅ done
```

**The frontend build is complete — every planned layer, done.**

See [`todo.md`](todo.md) for the full file-by-file build-out plan.

## 🖥 Getting Started

```shell
yarn install
```

1. Start a local Postgres — a `docker-compose.yml` is included:
   ```shell
   docker compose up -d
   ```
   Already have Postgres running elsewhere, or another container on port 5432?
   Point at your own instance, or override the published port:
   `POSTGRES_PORT=5434 docker compose up -d`.
2. Create a `.env` file in `backend/` per `backend/.env.example` (match
   `DEV_DB_PORT`/`TEST_DB_PORT` to whatever port you used above).
3. Create the database:
   ```shell
   yarn sqlz db:create
   ```
4. Run the migrations — the backend no longer auto-syncs the schema at boot, so this step is required:
   ```shell
   yarn sqlz db:migrate
   ```
5. (Optional) seed it with dummy data:
   ```shell
   yarn sqlz db:seed:all
   ```
6. Start the dev servers:
   ```shell
   yarn dev
   ```
   The frontend is fully wired now — `main.tsx`, `App.tsx`, and all 10 route
   pages exist — so this renders the real app at `http://localhost:3000`.

## License

MIT — see [LICENSE](LICENSE). Original work Copyright (c) 2021 RealWorld.
