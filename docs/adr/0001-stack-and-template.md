# 0001 — This repo is a template, and this is the stack it fixes

**Status:** accepted

This repository is a **starting point**, not a product. It exists so that a new
TypeScript project begins with the API, the frontend, the worker, the database,
and the tooling already wired together and already agreeing with each other. The
`note` module is a worked example of every seam, and is meant to be replaced.

**The stack, and why each piece is here.**

- **pnpm workspaces, `apps/**` only.** One lockfile, one `pnpm install`, and
  cross-app types by reference rather than by publishing. There is no
  `packages/**`: the template ships no shared library, so declaring the
  workspace pattern would be a promise the repo does not keep. Add it when
  there is a second consumer.
- **Hono + Zod.** Hono's RPC mode is the reason: `app.ts` exports
  `AppType`, the frontend imports it, and `hc<AppType>` gives the frontend
  compile-time knowledge of every route's path, params, body, and response. Zod
  validates at the edge and produces the issue list that the same frontend
  surfaces as field errors.
- **Prisma + Postgres.** Migrations and a typed client. The generated client is
  written into `apps/api/src/generated/prisma` and gitignored, so `db:generate`
  is a required step after cloning — a deliberate trade of one setup step for a
  much smaller repository.
- **BullMQ + Redis, in a separate process.** Request handlers stay fast, and a
  slow model call cannot hold a connection open. The worker is the same
  codebase as the API, so jobs reuse the modules and services directly.
- **TanStack Router + Query + Form, on Vite.** A router-only SPA — see
  [ADR 0002](0002-router-only-spa-loader-owns-fetching.md) for why there is no
  SSR framework.
- **oxlint + oxfmt.** Fast enough to run on every change, with no plugin
  configuration to maintain.
- **AI behind a gateway.** `src/ai/gateway.ts` is the only thing the app
  depends on; the SDK lives behind it. That is what lets the whole template run
  with no API key, and what keeps a fast-moving SDK from reaching into the
  domain.

**Consequences.** Fixed ports (Postgres 15432, Redis 16379, API 3000, Vite 5173)
mean two projects from this template cannot run at once without editing
configuration; the README documents this. The conventions in `AGENTS.md` are
load-bearing for the agent workflows that use this repo, so changing a
convention means changing that file in the same commit.
