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

**Status:** actively in progress — not yet a runnable app.

## 🧩 Stack

- **Frontend:** React 19 (Vite + SWC), React Router
- **Backend:** Express 5, Sequelize 6, PostgreSQL
- **Tooling:** Yarn workspaces, Vitest

## 🖥 Getting Started

> These instructions describe the target setup and will work once the
> backend and frontend workspaces have been added.

```shell
yarn install
```

1. Create a `.env` file in `backend/` per `backend/.env.example`.
2. Create the database:
   ```shell
   yarn sqlz db:create
   ```
3. (Optional) seed it with dummy data:
   ```shell
   yarn sqlz db:seed:all
   ```
4. Start the dev servers:
   ```shell
   yarn dev
   ```

## 📋 Project Tracking

Work on this fork is tracked two ways:

- **[`todo.md`](todo.md)** — the primary, detailed record: a phase-by-phase written log of everything done and everything still open, with dates and the reasoning behind each decision. This is the source of truth.
- **[GitHub Project board](https://github.com/users/Terrence721/projects/4)** — a Scrum-style Backlog/Planned/In Progress/Verification & QA/Done view of the same work, for a quick at-a-glance status without reading the full log. Kept in sync with [`todo.md`](todo.md).

## License

MIT — see [LICENSE](LICENSE). Original work Copyright (c) 2021 RealWorld.
