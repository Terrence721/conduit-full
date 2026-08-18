# 📝 Conduit — RealWorld Example App (Modernized Fork)

[![Quality](https://github.com/Terrence721/conduit-full/actions/workflows/quality.yml/badge.svg)](https://github.com/Terrence721/conduit-full/actions/workflows/quality.yml)
[![CodeQL](https://github.com/Terrence721/conduit-full/actions/workflows/codeql.yml/badge.svg)](https://github.com/Terrence721/conduit-full/actions/workflows/codeql.yml)

Last updated: August 13, 2026

This repository is an independently modernized fork of the RealWorld
**Conduit** example app — a Medium-style publishing platform (CRUD, auth,
pagination) built with
**React / Vite + SWC / Express.js / Sequelize / PostgreSQL**. It's not
affiliated with the RealWorld project or the original repo author.

Rather than copying the source app over wholesale, this fork is being rebuilt
one file at a time: each file is re-added deliberately, with dependencies and
patterns brought up to their current latest versions along the way. See the
commit history for a file-by-file record of that process.

**Status:** backend complete (100% TypeScript) and independently runnable; frontend in progress, being built one file at a time in TypeScript — see `todo.md` for exact status. Not yet runnable end-to-end.

## 🧩 Stack

- **Frontend:** React 19 (Vite + SWC), React Router
- **Backend:** Express 5, Sequelize 6, PostgreSQL
- **Tooling:** Yarn workspaces, Vitest

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

## 📋 Project Tracking

Work on this fork is tracked two ways:

- **[`todo.md`](todo.md)** — the primary, detailed record: a phase-by-phase written log of everything done and everything still open, with dates and the reasoning behind each decision. This is the source of truth.
- **[GitHub Project board](https://github.com/users/Terrence721/projects/4)** — a Scrum-style Backlog/Planned/In Progress/Verification & QA/Done view of the same work, for a quick at-a-glance status without reading the full log. Kept in sync with [`todo.md`](todo.md).
- **[Wiki](https://github.com/Terrence721/conduit-full/wiki)** — short pointers per backend module (models, helpers, middleware, controllers, routes) plus the TypeScript migration, testing, and security-hardening stories, each linking back to the real source rather than repeating it.

## License

MIT — see [LICENSE](LICENSE). Original work Copyright (c) 2021 RealWorld.
