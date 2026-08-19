# Enactus ISIMG — Web Platform Changelog

Scope: `web/` (Next.js 14 App Router + TypeScript + Tailwind + Prisma/PostgreSQL).

---

## Phase 4 — Operations & tooling (this session)

### Email delivery — SMTP transport
- `src/lib/mailer.ts` — rewritten around a shared `sendEmail()` with two pluggable transports:
  1. **SMTP** via `nodemailer` (used when `RESET_SMTP_HOST` is set),
  2. **HTTP email API** (Resend-style, previous transport, now a fallback).
  Returns `false` when neither is configured so dev keeps the existing fallback path.
- `src/app/api/auth/forgot-password/route.ts` — unchanged contract; still never leaks the reset link in production.
- `package.json` — added `nodemailer` (runtime) and `@types/nodemailer` (dev).
- `.env.example` — documented the new variables:
  `RESET_SMTP_HOST/PORT/SECURE/USER/PASS/REJECT_UNAUTHORIZED`, `RESET_EMAIL_API_URL/TOKEN`, `RESET_EMAIL_FROM`.

### Maintenance / prune job
- `prisma/maintenance.ts` — standalone scheduler-friendly script: deletes expired `PasswordResetToken`s and rate-limit buckets older than 24h (complements the lazy cleanup in `src/lib/rate-limit.ts`).
- `package.json` — new script `db:prune` → `tsx prisma/maintenance.ts`.
  Schedule it externally, e.g. a cron/systemd timer or GitHub Actions workflow:
  `npm run db:prune` (daily is plenty).

### Lint tooling — Biome
- Replaced the dangling `"lint": "next lint"` script (ESLint was never installed) with `biome check src`.
- Added `@biomejs/biome` (dev) and `biome.json`:
  - lint-only (formatter/assist disabled → zero reformatting of the codebase),
  - CSS override enables Tailwind directives and silences the intentional reduced-motion `!important` block.
- Applied Biome fixes across `src/`:
  - `import type` conversions, `node:` protocol imports, optional chaining, unused-import removal,
  - `type="button"` on 21 buttons across `AdminArea`, `MessagesManager`, `MissionsManager`, `ResourceManager`, `UsersManager`, `MemberArea`, `Header`, `use-toast` (a11y — prevents accidental form submits).

### Admin CRUD — verified already complete
Full create/edit/delete UI and APIs already existed (prior phase):
- `src/components/admin/ResourceManager.tsx` — generic CRUD UI for projects, departments, events, team, news.
- `src/components/admin/SettingsManager.tsx` — branding/site-settings editor (PUT `/api/settings`).
- Route handlers: `src/app/api/{projects,events,departments,team,news}/*`, `src/app/api/settings/route.ts`.
  This session added no code; verification below proves the full cycle works.

### Email blacklist — not applicable
No email-blacklist, text-file, or server-side `fs` writes exist anywhere in the codebase (searched: `blacklist`, `blacklisted`, `hard-bounce`, `deny-list`, `disposable`, `writeFile`, `readFile`, `node:fs`). Nothing to migrate.

### Files touched this session
```
web/CHANGELOG.md                     (this file, new)
web/biome.json                       (new)
web/src/lib/mailer.ts                (rewritten: SMTP + HTTP transports)
web/prisma/maintenance.ts            (new: db:prune job)
web/src/middleware.ts                (optional-chain refactor, same semantics)
web/src/app/api/missions/[id]/route.ts (noImplicitAnyLet fix, control flow unchanged)
web/src/components/{admin,member,site,ui}/* + src/app/departments/page.tsx
                                     (a11y type="button", unused-import & import-type fixes)
web/src/lib/password-reset.ts        (node:crypto protocol)
web/package.json                     (lint/db:prune scripts, nodemailer, @biomejs/biome, @types/nodemailer)
web/.env.example                     (SMTP / HTTP email env vars)
```

### Phase 4 verification (all green)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm run lint` (biome check src) | 0 diagnostics on 77 files |
| `npx prisma validate` | valid |
| `npm run build` (production) | pass |
| CRUD e2e (dev server): project/event create→update→delete, settings PUT/GET | 13/13 |
| Forgot-password after mailer refactor (dev fallback + reset with link) | pass |
| Prod runtime: middleware 401/403 on admin writes, prod forgot-password leaks no link, CSP/HSTS headers | 7/7 |
| `npm run db:prune` removes expired tokens + stale buckets, keeps active rows | pass |

---

## Phase 3 — Cleanup (previous session)

- Deleted dead code: unused `TeamCard`/`TeamGrid`, `Alert`/`Badge`/`Container`, `STATUS_LABELS`/`MISSION_STATUS_LABELS`/`IDENTITY`, unused query helpers (`getTeam`, `getNews`, `getContactEmail`).
- Consolidated duplicated status badges → `src/components/status.tsx` (`StatusBadge`, `StatusPill`); team card → `src/components/site/TeamCard.tsx`.
- Removed the legacy HTML/JS app (`index.html`, `admin.html`, `login.html`, `member.html`, `js/`, `enactuss/`, `netlify.toml`) — verified zero references remain in `web/`.
- `.gitignore` hygiene: `*.log`, `logs/`, `.vscode/`, `.idea/`, `*.swp`, `Thumbs.db`, `.eslintcache`.
- Verified: typecheck, prod build, and a 40-check e2e regression (routes, prod headers, password-reset flows, authz, last-admin, rate-limit) — all green.

---

## Phase 2 — Feature migration (previous session)

- Prisma→PostgreSQL schema: `User`, `Department`, `Project`, `TeamMember`, `Event`, `News`, `Mission`, `ContactMessage`, `Setting` (+ auth tables below).
- Portfolio module: skills/departments/achievements, projects, events + public API endpoints (`/api/projects`, `/api/events`, `/api/departments`, etc.).
- Admin dashboard: `/admin` with stats, users, projects, departments, events, team, news, missions, messages, settings tabs and their CRUD APIs.
- Members area: `/member` with points/gamification, missions (submit/review), profile, 3-day End-of-Month bonus task, leaderboard.
- Contact form → `ContactMessage` rows + admin messages inbox.
- Register → `PENDING` approval flow; `IMP-6-gamification-missions` seed data; branding config (`/api/settings/{,public}`).
- Migrations: `20260818150906_init`, `20260818154226_add_contact_user_id`.

---

## Phase 1 — Security hardening (previous session)

- Auth: httpOnly session cookie signed with `jose` (HS256) — `src/lib/auth.ts`, `src/middleware.ts`.
- Passwords hashed with `bcryptjs`; admin can reset member passwords and bump `tokenVersion` to revoke sessions.
- DB-backed rate limiting (atomic upsert, fixed window) — `src/lib/rate-limit.ts` (`AUTH_LIMITS`).
- Password reset: hashed one-time tokens with 1-hour TTL — `src/lib/password-reset.ts`, `PasswordResetToken` model.
- Security headers in `next.config.mjs`: CSP (immutable `frame-ancestors 'none'`, `object-src 'none'`; HSTS only in prod), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- Last-admin protection; account-enumeration-safe forgot-password; `PASSWORD_RESET_DEV_LINK` clearly gated to non-prod.
- Migrations: `20260818163859_mission_points_awarded`, `20260818173456_security_hardening_additive`.

---

## Operational notes

- **DB**: PostgreSQL (Postgres instance in local env; `DATABASE_URL`). The earlier "SQLite" description in session notes was incorrect — schema/`prisma validate` use `provider = "postgresql"`.
- **Known pre-existing audit findings** (deliberate version pins, would require breaking major upgrades — not addressed):
  `next@14.2.21` (critical DoS/SSRF advisories fixed in newer majors), `postcss <=8.5.22` (high), `tsx 4.19.x`/`esbuild` (moderate).
- **Git hygiene**: the git working repo is rooted at the user's home directory and does not track this project folder. Recommend initializing a clean repository at `web/` (or the project folder) before relying on version control for this code.