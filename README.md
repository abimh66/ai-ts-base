# ai-ts-base

A TypeScript monorepo template: a typed API, a React SPA, and a background
worker, wired together end to end. Clone it, rename it, and start building.

```bash
git clone <this-repo> my-new-project
cd my-new-project
pnpm install
pnpm init:project my-new-project
```

`init:project` renames the project everywhere it appears (package name, database
name, test database, brand, docs), drops the template's git history, and makes
the first commit. It scans every text file in the repo, so a file added later
cannot be missed. It runs after `pnpm install` because it uses the workspace's
`tsx`.

Then:

```bash
cp .env.example .env
pnpm db:up && pnpm db:push
pnpm dev          # API on :3000, frontend on :5173
pnpm worker       # second terminal: processes background jobs
```

Open http://localhost:5173, create a note, and press **Enrich with AI** — the
API queues a job, the worker picks it up, and the page polls until the note is
enriched. Without an `OPENROUTER_API_KEY`, the worker reverts the note to
`Draft` instead of hanging, so the whole pipeline is exercisable with no AI
account.

## What is in the box

```
apps/api/        Hono + Zod + Prisma, plus the BullMQ worker
apps/frontend/   Vite + React 19 + TanStack Router/Query/Form + shadcn/ui
scripts/init.ts  the one-time template rename
docs/            ADRs, agent docs, roadmap
```

The one worked example is the `note` module — deliberately small, but complete:
a Prisma model, a Zod schema, a service, Hono routes, tests, a queue producer, a
worker consumer, and an AI gateway. It is the reference for how a module is
shaped; replace it with your own domain.

### Stack

| Layer    | Choice                                                            |
| -------- | ----------------------------------------------------------------- |
| API      | Hono, Zod, Prisma 7 (Postgres)                                    |
| Jobs     | BullMQ over Redis, run by a separate worker process               |
| AI       | `@anvia/*` over OpenRouter, behind a gateway seam                 |
| Frontend | Vite, React 19, TanStack Router + Query + Form + Table, shadcn/ui |
| Tooling  | pnpm workspaces, oxlint + oxfmt, Vitest, docker-compose           |

### Ports

Fixed, so that every project cloned from this template collides with every
other one. Postgres is on **15432** and Redis on **16379** (not their defaults)
to leave the standard ports free; API is **3000** and Vite **5173**.

If you run two projects from this template at once, stop the first or change
`.env` (`PORT`), `docker-compose.dev.yml`, and `apps/frontend/vite.config.ts`
for the second.

## Commands

| Command               | Does                                                     |
| --------------------- | -------------------------------------------------------- |
| `pnpm dev`            | API + frontend together                                  |
| `pnpm worker`         | the BullMQ worker (separate process)                     |
| `pnpm db:up` / `down` | start / stop Postgres and Redis                          |
| `pnpm db:push`        | apply the Prisma schema                                  |
| `pnpm db:generate`    | regenerate the Prisma client into `src/generated/prisma` |
| `pnpm db:seed`        | seed a couple of notes                                   |
| `pnpm db:studio`      | Prisma Studio                                            |
| `pnpm test`           | Vitest (needs `pnpm db:up`; uses a separate test DB)     |
| `pnpm typecheck`      | `tsc --noEmit` across the workspace                      |
| `pnpm lint`           | oxlint                                                   |
| `pnpm format`         | oxfmt                                                    |

## Conventions

The API is **module-based** (`router` + `schema` + `service` per module); the
frontend is **feature-based and flat** (`api` + `hooks` + `types` + `search` +
one `components/` folder). Data loading goes through route loaders. The full
rules, and the reasoning behind them, are in [`AGENTS.md`](AGENTS.md) and
[`docs/adr/`](docs/adr/).

## Environment

`.env.example` documents every variable. The only one you need for the template
to run is none — Postgres and Redis come from `docker-compose`. Set
`OPENROUTER_API_KEY` to turn the AI enrichment on.
