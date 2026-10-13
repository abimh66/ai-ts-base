# ai-ts-base

## Stack & conventions

### Frontend (`apps/frontend`)

- **UI:** shadcn/ui. **NEVER hand-write a shadcn component** — add it with `pnpm dlx shadcn@latest add <component_name>`. Style with Tailwind.
- **Libraries:** TanStack Router (routing), TanStack Query (server state), TanStack Form (forms), TanStack Table (tables), Zod (validation), Zustand (global client state, only if needed).
- **Structure: feature-based, flat.** Each feature is a folder of flat files plus one `components/` folder — never a subfolder per concern, never a per-concern barrel:
  - `index.ts` — the feature's public barrel (the only barrel): it re-exports `api.ts`, `hooks.ts`, `types.ts`, and `search.ts`, and those are imported from the feature root (`@/features/<name>`), never by deep path. `components/` is imported by path, so route-level code-splitting stays intact.
  - `api.ts` — fetch functions, API error classes (carrying HTTP `status`), and the `queryOptions` + query-key objects.
  - `hooks.ts` — `useQuery` / `useMutation` wrappers over `api.ts`.
  - `types.ts` — the feature's domain types.
  - `search.ts` — the route search schema, where the feature has URL list/flow state.
  - `components/` — the only folder; `.tsx` files only.
    Page components live directly in `src/routes/` (TanStack Router file-based routing).
- **Data loading (see ADR 0002):** a route's `loader` calls `context.queryClient.ensureQueryData(...)` and the component reads `useSuspenseQuery` off the same `queryOptions`; loaders own only a route's primary data. Polling/background queries stay `useQuery`. Router-level `defaultPendingComponent` / `defaultErrorComponent` / `defaultNotFoundComponent` provide the generic slots; route-local `pendingComponent` / `errorComponent` / `notFoundComponent` override where the shape differs. Query defaults live in `lib/query.ts`; list state uses a Zod `validateSearch` schema.
- **Naming:** the non-suspending read is `useX`, the loader-backed one is `useXSuspense`. Chrome that renders outside a route loader (the sidebar) must use the non-suspending form, so it never blocks the shell.

### Backend (`apps/api`)

- **Structure: module-based.** Each module contains at least `router` (Hono routes), `schema` (Zod), and `service` (business logic, taking `prisma` as its first argument so it is testable without a server). Prisma for persistence. A module grows `jobs.ts` (queue names + payload types) and `pipeline.ts` (the work the worker runs) only when it has background work.
- **Validation:** validate at the edge with `validator("json", ...)` and map Zod issues through the local `toIssues` helper, so every route returns the same `{ error, issues }` error shape.
- **Errors:** throw `HttpError` from services and let `app.ts`'s `onError` turn it into a response. Do not build error responses inside services.
- **Types:** `app.ts` exports `export type AppType = ReturnType<typeof createApp>`; the frontend consumes it through `hc<AppType>` in `lib/api.ts`. This is what makes frontend calls type-safe end to end — do not widen it to `any`.

### AI

- Model calls go through a gateway (`src/ai/gateway.ts`) that the app depends on, never through the SDK directly. The gateway has an unavailable implementation, so the app runs with no API key. Prompts live in `src/ai/prompts/`.

### Other

- Long-running AI work runs in a separate worker process (`apps/api/src/worker.ts`) over BullMQ + Redis; the API handles requests. See `docs/roadmap.md`.

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
