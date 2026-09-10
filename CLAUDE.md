# CLAUDE.md

Guidance for Claude Code (and any other agent) working in this repository.

## Code quality standards: DRY and SOLID

This codebase is intentionally held to **DRY** (Don't Repeat Yourself) and the five **SOLID** principles (SRP, OCP, LSP, ISP, DIP), applied pragmatically for a RealWorld-clone REST API + SPA of this size — not academically. As a portfolio piece, demonstrating real engineering discipline is part of the point, not incidental polish.

**When adding or touching any file:**

- Before writing a new abstraction, check whether the same logic/type/shape already exists elsewhere. This codebase's own established threshold is **extract at the second real occurrence** — not the first (premature), not left un-extracted at the third (see `frontend/src/types.ts`'s `MessageResponse`/`ArticleResponse`/`ProfileResponse`, each promoted once a shape appeared in exactly two files).
- Route auth checks through the existing shared mechanism (`frontend/src/helpers/requireAuth.ts` on the frontend; `backend/middleware/authentication.ts`'s `requireAuth` middleware on the backend) instead of re-implementing the guard inline at each call site.
- Keep controllers/components/services to one real responsibility. A function doing input validation + business logic + persistence + response shaping all at once is a signal to split it — but don't split apart something that's already one coherent job just to make more files.
- Prefer a small table/factory over an if/else or switch chain that requires editing existing code to add a new case (see `backend/controllers/user.ts`'s `UPDATABLE_FIELDS` table and `backend/middleware/rateLimiter.ts`'s factory for examples already done well in this repo).
- Don't invent violations that don't matter in practice for a project this size (e.g. controllers calling Sequelize models directly is an accepted, deliberate pattern here — not a DIP violation on its own).

**Audit history:** a full DRY/SOLID audit of `backend/` and `frontend/src/` was run 2026-09-07 (two independent read-only passes), producing 12 backend findings (4 high / 6 medium / 2 low) and 8 frontend findings (2 high / 4 medium / 2 low). See `todo.md`'s Phase 116 entry for the full list and verdict. All 20 findings were fixed incrementally, one file/commit at a time, closed out as of 2026-09-10 (see `todo.md`'s Phase 118 entry). **Re-run a pass like this periodically as the codebase grows** — this file existing is meant to stop that from being a one-time check that quietly lapses (the same failure mode issue #71's test-coverage tracking hit three separate times before this file existed).

## Workflow conventions established on this project

- **One file at a time.** Never bulk-edit or bulk-copy multiple files in a single pass — add or fix one, let it be inspected, then move to the next.
- **Every `git commit`/`git push` requires the user's explicit go-ahead**, even mid-file-cycle. Edits and checks (typecheck/lint/format/test) can proceed freely without asking first.
- **Fix everything immediately.** No real finding (lint, typecheck, format, a genuine reuse/simplification/DRY/SOLID finding) is too small to fix on sight — don't defer or skip it. This isn't license to invent findings that aren't real, though.
- Run both `yarn typecheck` and `yarn format:check` before every commit, not typecheck alone.
- For a fix that spans multiple files, order commits dependency-first: the shared type/helper/abstraction lands first, each consumer follows as its own separate commit.
