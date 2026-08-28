# 📝 Conduit — RealWorld Example App (Modernized Fork)

[![Quality](https://github.com/Terrence721/conduit-full/actions/workflows/quality.yml/badge.svg)](https://github.com/Terrence721/conduit-full/actions/workflows/quality.yml)
[![CodeQL](https://github.com/Terrence721/conduit-full/actions/workflows/codeql.yml/badge.svg)](https://github.com/Terrence721/conduit-full/actions/workflows/codeql.yml)

**[📜 View the portfolio page →](https://terrence721.github.io/conduit-full/portfolio.html)**

Last updated: August 28, 2026

This repository is an independently modernized fork of the RealWorld **Conduit** example app — a Medium-style publishing platform (CRUD, JWT auth, pagination) built with **React 19 / Vite + SWC / Express 5 / Sequelize / PostgreSQL**. It's not affiliated with the RealWorld project or the original repo author.

Rather than copying the source app over wholesale, this fork is being rebuilt one file at a time: each file is re-added deliberately, with dependencies and patterns brought up to their current latest versions along the way, and every real bug fixed via a real failing test — not read twice and assumed fine.

**At a glance:** 214/214 backend tests passing, 8/8 frontend tests passing, 0 open CodeQL alerts, 41 real bugs found and fixed — see the Quality/CodeQL badges above for live CI status. **Known gap:** the 33 files tracked by [issue #71](https://github.com/Terrence721/conduit-full/issues/71) have zero behavioral test coverage yet (typecheck+lint+`/simplify` only) — tracked openly, not hidden.

## 🧭 Start Here

- **[System Architecture](https://terrence721.github.io/conduit-full/diagrams/system-architecture.html)** — the dev-proxy → Express → Postgres request path, and where the (in-progress) frontend fits
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
  frontend/components 15 of 31, see todo.md for the list                    🚧 in progress
  frontend/routes     ~10 route pages                                       ⏳ not started
  frontend/App+main   entry point — last, once everything above exists      ⏳ not started
```

See [`todo.md`](todo.md) for the full file-by-file build-out plan.

## 🖥 Getting Started

> Steps 1–4 (env, database, migrations, seed data) work today against the
> backend alone. Step 5 (`yarn dev`) won't render anything yet — the frontend
> workspace exists, but its entry point (`main.tsx`) and every route/component
> that depends on it are still being built.

```shell
yarn install
```

1. Create a `.env` file in `backend/` per `backend/.env.example`.
2. Create the database:
   ```shell
   yarn sqlz db:create
   ```
3. Run the migrations — the backend no longer auto-syncs the schema at boot, so this step is required:
   ```shell
   yarn sqlz db:migrate
   ```
4. (Optional) seed it with dummy data:
   ```shell
   yarn sqlz db:seed:all
   ```
5. Start the dev servers:
   ```shell
   yarn dev
   ```

## License

MIT — see [LICENSE](LICENSE). Original work Copyright (c) 2021 RealWorld.
