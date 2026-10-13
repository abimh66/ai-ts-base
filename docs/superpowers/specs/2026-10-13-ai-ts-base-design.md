# ai-ts-base — Reusable TypeScript Monorepo Template

**Date:** 2026-10-13
**Status:** Approved design, ready for implementation planning

## Problem

Every new project currently starts by copying files out of an existing project, which
drags that project's domain along with it. `project-hr-assistant` is the most complete
codebase available, but its abstractions — stages, verdicts, evidence, composite scoring,
CV intake — are HR concepts. A new project that inherits them has to identify and delete
dead-looking-but-load-bearing code before it can begin.

The goal is a repository that can be cloned to start a project with the stack, tooling,
conventions, and working end-to-end plumbing already in place, and no domain that has to
be removed.

## Goals

- Clone → `pnpm install` → working API, worker, and frontend against local Postgres and
  Redis, with no code deletion required to get there.
- Preserve the conventions that make the existing stack productive: Hono RPC typing
  shared with the frontend, the feature-folder frontend layout, route loaders owning
  primary data, the AI gateway seam, and the worker/queue split.
- Keep the example slice small enough to delete in a few minutes when a real domain
  arrives.
- Ship the agent-facing documentation conventions (issue tracker, triage labels, domain
  docs) so a new project inherits the working style, not just the code.

## Non-goals

- Authentication, sessions, or a `User` model. No such thing exists in the source project;
  adding it would be net-new unproven code.
- File intake (`pdf-parse`, `mammoth`, `apps/uploads`).
- Internationalisation. `project-hr-assistant` has a 503-line `src/i18n/` that is entirely
  HR copy. A project that wants i18n should add it deliberately.
- An empty `packages/**` workspace. The glob is declared in the source project but unused.
- A generator CLI, interactive prompts, or per-project port shifting.

## Approach

Copy only files that contain zero domain assumptions; write everything else fresh against
the documented conventions.

Two rejected alternatives:

- **Copy and prune.** Copy the whole repository and delete HR files. Fastest to produce,
  but every derived project inherits HR-shaped abstractions that appear load-bearing and
  are not, plus domain concepts that survive the deletion pass unnoticed.
- **Extract packages.** Move shared code into `packages/api-kit` and `packages/ui`. Cleaner
  in principle, but with one app of each kind it adds indirection and buys nothing.

## Deliverable

A git repository at `ai-ts-base`, built and verified locally. It is not pushed; the user
pushes it to GitHub and marks it a template repository.

Root package name `ai-ts-base`, database `ai_ts_base`, test database `ai_ts_base_test`,
Docker Compose project `ai-ts-base`.

### Consumption model

```sh
git clone <template-url> my-new-project
cd my-new-project
pnpm install
pnpm init:project my-new-project
pnpm db:up && pnpm db:push
pnpm dev
```

`pnpm init:project` renames the project and resets git history.

## Repository layout

```
ai-ts-base/
├── README.md                     fresh
├── AGENTS.md                     fresh
├── GLOSSARY.md                   fresh
├── package.json                  fresh
├── pnpm-workspace.yaml           copied, `packages/**` glob removed
├── pnpm-lock.yaml                generated
├── docker-compose.dev.yml        copied, database renamed
├── vitest.config.ts              copied
├── vitest.global-setup.ts        copied, test database renamed
├── .gitignore                    copied and CORRECTED (see below)
├── .oxlintrc.json                copied
├── .oxfmtrc.json                 copied
├── .vscode/                      copied
├── .env.example                  fresh
├── .scratch/README.md            fresh
├── scripts/init.ts               fresh
├── docs/
│   ├── adr/0001-stack-and-template.md            fresh
│   ├── agents/domain.md                          copied
│   ├── agents/issue-tracker.md                   copied
│   ├── agents/triage-labels.md                   copied
│   ├── roadmap.md                                fresh, near-empty
│   └── superpowers/specs/2026-10-13-ai-ts-base-design.md   this document
├── apps/api/
└── apps/frontend/
```

## Correcting the .gitignore

The source project uses a reverse-pattern `.gitignore`: ignore `*`, then allowlist
specific paths. Its allowlist is incomplete, and this has a consequence that would be
fatal for a template.

Verified against `project-hr-assistant`: 227 files are tracked, and the following are
**ignored and untracked**, existing only on the author's disk:

| Path | Contents |
|---|---|
| `GLOSSARY.md` | the domain glossary |
| `docs/` | all four ADRs, `agents/`, `roadmap.md` |
| `.scratch/` | the entire issue tracker — every spec and issue file |
| `.vscode/` | editor settings |
| `scripts/` | would swallow the init script |

`git check-ignore` confirms the cause: the bare `*` rule at `.gitignore:5` matches them,
and no allow rule reaches them. A clone of that repository loses its ADRs, glossary, and
issue history.

`ai-ts-base` copies the pattern but adds allow rules for:

```
!scripts/**
!docs/**
!GLOSSARY.md
!.scratch/**
!.vscode/**
```

`docs/superpowers/` is committed in the template so the design is reviewable, and removed
by `init:project` so derived projects do not inherit it.

## Root scripts

`package.json` at the root defines the commands used throughout this document. The source
project only has `test` / `lint` / `format` at the root and requires `--filter` for
everything else; the template adds thin wrappers so the common paths are one command.

| Script | Command |
|---|---|
| `dev` | `pnpm --parallel --filter api --filter frontend dev` |
| `worker` | `pnpm --filter api worker` |
| `db:up` | `docker compose -f docker-compose.dev.yml up -d` |
| `db:down` | `docker compose -f docker-compose.dev.yml down` |
| `db:push` | `pnpm --filter api db:push` |
| `db:generate` | `pnpm --filter api db:generate` |
| `db:seed` | `pnpm --filter api db:seed` |
| `db:studio` | `pnpm --filter api db:studio` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `lint` | `oxlint` |
| `format` | `oxfmt .` |
| `format:check` | `oxfmt --check .` |
| `typecheck` | `pnpm -r typecheck` |
| `init:project` | `tsx scripts/init.ts` |

`dev` runs the API and frontend together; the worker is deliberately separate, matching the
source project's split between request handling and long-running work.

## Files deliberately not copied

`project-hr-assistant` contains per-app `pnpm-lock.yaml` and `pnpm-workspace.yaml` files
under `apps/api/` and `apps/frontend/`. These are stray artifacts — a pnpm workspace has one
lockfile and one workspace file, at the root. They are not copied, and the template
generates a single root `pnpm-lock.yaml`.

## The example slice

One model, one enum, exercising every convention end to end.

```prisma
enum NoteStatus { Draft, Enriching, Enriched }

model Note {
  id        String     @id @default(cuid())
  title     String
  body      String
  status    NoteStatus @default(Draft)
  summary   String?
  tags      String[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

No `User` model. The source project needs one only for its seeded single-user fiction.

`Enriching` exists so the detail page's polling loop has a defined state to wait on.

### API — `apps/api/src/modules/note/`

Module layout follows the source convention: `router.ts` (Hono routes), `schema.ts` (Zod),
`service.ts` (business logic, takes `prisma` as its first argument).

| Method | Path | Behaviour |
|---|---|---|
| `GET` | `/api/notes` | list; `status` and `q` query params, Zod-validated |
| `POST` | `/api/notes` | create from `createNoteSchema` |
| `GET` | `/api/notes/:id` | `HttpError(404)` when absent |
| `PATCH` | `/api/notes/:id` | update `title` / `body` / `status` |
| `DELETE` | `/api/notes/:id` | delete |
| `POST` | `/api/notes/:id/enrich` | set `Enriching`, enqueue, return `202` |

`app.ts` ends with `export type AppType = ReturnType<typeof createApp>`, and the frontend's
`lib/api.ts` uses `hc<AppType>(apiBaseUrl)`. This shared RPC typing is the single most
valuable property of the source setup and is preserved exactly.

`src/config/queue.ts` and `src/config/queue-connection.ts` are copied verbatim, as is
`src/lib/http-error.ts`.

### Worker and AI

- `POST /:id/enrich` sets status `Enriching` and calls `deps.queue.enqueue("note.enrich", { noteId })`.
- `worker.ts` registers a BullMQ `Worker` for `note.enrich`: load the note, call
  `deps.ai.enrich({ title, body })`, write `summary`, `tags`, and `status: Enriched`.
- `ai/gateway.ts` defines `AiGateway` with exactly one method, `enrich`, plus
  `AiUnavailableError` and `createUnavailableAiGateway()`.
- `ai/openrouter-gateway.ts` implements it with `@anvia/core` + `@anvia/openai` against
  OpenRouter, throwing `AiUnavailableError` when `OPENROUTER_API_KEY` is unset.
- `ai/prompts/enrich.ts` holds the Zod output schema (`{ summary, tags }`), an instructions
  constant, and `buildEnrichPrompt()` — the same three-part shape as the source prompts.
- On `AiUnavailableError` the worker reverts the note to `Draft` and logs. The UI shows an
  "AI disabled" hint instead of an indefinite spinner.

### Frontend — `apps/frontend/src/features/note/`

Flat feature layout per `AGENTS.md`: `index.ts` (the only barrel, re-exporting `api`,
`hooks`, `types`, `search`), `api.ts` (`queryOptions` + query-key objects), `hooks.ts`,
`types.ts`, `search.ts`, `components/`.

Routes:

- `_app/index.tsx` — redirects to `/notes`
- `_app/notes/index.tsx` — list, create; Zod `validateSearch` with `status` and `q`,
  defaulted fields stripped via `stripSearchParams`
- `_app/notes/$noteId.tsx` — detail; loader calls `context.queryClient.ensureQueryData`,
  component reads `useSuspenseQuery` off the same options (ADR 0002 pattern); polls with
  `refetchInterval` while `status === "Enriching"`

### Copied frontend files

Verbatim: `index.html`, `vite.config.ts`, `tsconfig.json`, `tsr.config.json`,
`components.json`, `src/styles.css`, `src/main.tsx`, `src/router.tsx`,
`src/vite-env.d.ts`, `src/hooks/use-mobile.ts`, all of `src/components/ui/`,
`src/components/{theme-provider,theme-toggle,icon,page-header,route-states}.tsx`,
`src/lib/{api,api-error,query,query-client,loaders}.ts`.

Edited: `app-sidebar.tsx` and `brand.tsx` — HR navigation and branding removed.

Excluded: `user-menu.tsx` (no auth), `src/i18n/`.

### Tests

`vitest.config.ts` and `vitest.global-setup.ts` are copied with the test database renamed
to `ai_ts_base_test`. The global setup still creates the database and runs `prisma db push`
against it.

Shipped tests, proving the harness works rather than chasing coverage:

- `modules/note/schema.test.ts` — validation edges
- `modules/note/service.test.ts` — against the real test database, source pattern
- `modules/note/router.test.ts` — through `app.request`
- `features/note/search.test.ts` — search-param resolution

## `scripts/init.ts`

Run as `pnpm init:project <name>` immediately after cloning.

1. Rewrite the project name in `package.json`, `README.md`, `AGENTS.md`, `GLOSSARY.md`,
   `POSTGRES_DB` in `docker-compose.dev.yml`, `DATABASE_URL` in `.env.example`, and the
   test-database name in `vitest.global-setup.ts`.
2. Remove `docs/superpowers/`.
3. Delete `.git`, run `git init`, create an initial commit.
4. Refuse to run when a marker file records that it already ran.

Ports are fixed: Postgres `15432`, Redis `16379`, API `3000`, Vite `5173`. Two projects
running simultaneously will collide; the README documents this and says to edit the ports
by hand if it matters.

## Environment

`.env.example`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/ai_ts_base?schema=public"
REDIS_URL="redis://localhost:16379"
PORT="3000"

# Leave OPENROUTER_API_KEY unset to keep AI calls disabled.
OPENROUTER_API_KEY=""
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
AI_ENRICH_MODEL="openai/gpt-4o-mini"
```

## Risks

- **The copied `src/components/ui/` set is large and shadcn-generated.** It is committed
  because `AGENTS.md` forbids hand-writing these components and regeneration requires
  network access. A derived project may prune what it does not use.
- **`@anvia/*` is a fast-moving private-feeling dependency.** Version ranges are copied
  from the source project's lockfile-resolved versions. If the AI path fails to build,
  the gateway seam means the API, worker, and frontend still run with AI disabled.
- **The corrected `.gitignore` changes behaviour for the source project too.** Applying the
  same fix to `project-hr-assistant` would bring its ADRs, glossary, and issue tracker into
  version control for the first time. That is a separate change, flagged here because the
  data loss risk is live.

## Verification

The template is considered working when, from a fresh clone into an empty directory:

1. `pnpm install` succeeds.
2. `pnpm db:up && pnpm db:push` brings up Postgres and Redis and creates the schema.
3. `pnpm dev` serves the API on `:3000` and the frontend on `:5173`.
4. Creating a note in the UI persists it and lists it.
5. `pnpm worker` processes an enrich request, and with `OPENROUTER_API_KEY` unset the note
   returns to `Draft` with an "AI disabled" hint rather than hanging.
6. `pnpm test`, `pnpm lint`, and `pnpm format:check` pass.
7. `git ls-files` includes `GLOSSARY.md`, `docs/`, `.scratch/`, `scripts/`, `.vscode/`.
