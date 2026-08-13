# 📝 TODO

**Last Updated: August 13, 2026**

A living list of what's done and what's left on this fork. This is an independently modernized fork of the RealWorld Conduit example app: rather than copying the source repo over wholesale, it's being rebuilt one file at a time, with dependencies and patterns brought up to their current latest along the way. See [README.md](README.md) for the project description and [LICENSE](LICENSE) for licensing.

## At a glance

**Done, in full:**

| Item | Detail |
| --- | --- |
| Repo bootstrap | git init, yarn workspace root, MIT LICENSE (original RealWorld copyright preserved), README, Contributor Covenant CODE_OF_CONDUCT |
| `backend/package.json` | Added, with dependencies bumped to current latest where newer versions existed |
| CI + lint/format tooling | ESLint (flat config) + Prettier + Vitest + CodeQL wired up via `quality.yml`/`codeql.yml` — none of this existed in the source repo |
| Portfolio infrastructure | Added to the portfolio hub as a 4th project card; GitHub Project board created and matched to the sibling repos' Backlog/Planned/In Progress/Verification & QA/Done scheme |

**Actually still open, right now:** the entire backend (models, migrations, helpers, middleware, controllers, routes, seeders, `index.js`) and the entire frontend (all components, routes, services, context, hooks) — being added file by file. See the commit history or the [project board](https://github.com/users/Terrence721/projects/4) for current status.

## ✅ Done

### Repository bootstrap

| Phase | Date | What |
| --- | --- | --- |
| 1 | 2026-08-13 | `git init`; root `package.json` written as a yarn workspace (`backend`/`frontend`), `packageManager: "yarn@1.22.22"` pinned; `.gitignore` carried over from the source repo unchanged (already sensible for yarn); `LICENSE` added — MIT, preserving the original "Copyright (c) 2021 RealWorld" notice rather than replacing it, since this is a fork, not original work; `CODE_OF_CONDUCT.md` added (Contributor Covenant 2.1, single-maintainer variant, modeled on coolify-full's); `README.md` written describing the modernization approach, deliberately kept minimal (no CI badges, `todo.md`, or portfolio-page links) since none of that existed yet at the time |
| 2 | 2026-08-13 | Root `vitest.config.js` carried over unchanged from the source repo |
| 3 | 2026-08-13 | GitHub repo created (`Terrence721/conduit-full`, public), initial commit pushed to `main` |

### `backend/package.json`

| Phase | Date | What |
| --- | --- | --- |
| 4 | 2026-08-13 | `backend/package.json` added. Dependencies bumped to current latest where newer versions existed: `dotenv` 17.3.1 → 17.4.2, `pg` 8.20.0 → 8.23.0 (`express`, `sequelize`, `bcrypt`, `cors`, `jsonwebtoken`, `pg-hstore`, `sequelize-cli` were already at latest). `"sqlz"` script switched from `npx sequelize-cli` to plain `sequelize-cli` (yarn already puts `node_modules/.bin` on `PATH` for package scripts). Added `"private": true` |

### CI + lint/format tooling

| Phase | Date | What |
| --- | --- | --- |
| 5 | 2026-08-13 | ESLint flat config (`eslint.config.js`) and Prettier (`.prettierrc.json`/`.prettierignore`) added — neither existed in the source repo, added to match the modernization goal and all three sibling repos' convention. Scoped per directory: `backend/**/*.js` as CommonJS with Node globals, `frontend/src/**/*.{js,jsx}` as ESM with browser globals plus React/React Hooks/React Refresh plugins. Vitest globals (`describe`/`it`/`test`/`expect`/`vi`/...) declared explicitly for test files, since the `globals` npm package has no vitest set and `vitest.config.js` uses `test.globals: true` rather than importing them |
| 6 | 2026-08-13 | `.github/workflows/quality.yml` (lint/test/prettier jobs) and `codeql.yml` (javascript, `security-extended`, `trap-caching: false`) added — modeled on the sibling portfolio repos' `quality.yml`/`codeql.yml` pattern, shaped off platform-main's (closest stack match: Node + Yarn + Vitest) with its Nx-specific commands (`yarn nx affected -t ...`) removed, since this isn't an Nx workspace. The `test` job is expected to fail until the frontend (and its `setupTests.js`) is added — a known, accepted gap, not a config bug |
| 7 | 2026-08-13 | Root `package.json` gained `"type": "module"` to fix an ESLint warning about `eslint.config.js`'s ESM `import` syntax being reparsed from CommonJS |

### Portfolio infrastructure

| Phase | Date | What |
| --- | --- | --- |
| 8 | 2026-08-13 | Added to the portfolio hub ([terrence721.github.io](https://terrence721.github.io/)) as a 4th project card. Given there was no app code, CI, or portfolio page yet at the time, it got an "In Progress" status line instead of fabricated stats, and its "View project" link points at the repo rather than a `portfolio.html` that doesn't exist yet |
| 9 | 2026-08-13 | GitHub Project board created ([#4](https://github.com/users/Terrence721/projects/4)); its default Status field (Todo/In Progress/Done) was rebuilt to match the other three repos' Backlog/Planned/In Progress/Verification & QA/Done scheme, including the same option colors/descriptions as coolify-full's board; linked to the repo. First backlog card added: "Add cloud deployment step to CI (Azure or AWS)" |
