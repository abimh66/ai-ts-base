# Roadmap

Deliberately near-empty: this is a template, so anything listed here is a
**deliberate omission**, recorded so that the next person knows it was a choice
rather than an oversight.

## Excluded on purpose

- **Auth.** No sessions, no users, no permissions. Every request is trusted.
  Add it when the project needs it, not before.
- **File intake.** No uploads, no document parsing. The `note` module is
  text-only.
- **Shared `packages/**`.** The workspace pattern is `apps/**` only. Add
  `packages/**` when a second app genuinely needs to import from a first.
- **A dashboard.** `/_app/` redirects to `/notes`. Put a real home screen there
  when there is something to show.

## When the example is replaced

The `note` module is the reference implementation of every seam: a Prisma model,
a Zod schema, a service, Hono routes, tests, a queue producer, a worker
consumer, and an AI gateway. When you replace it with your own domain, keep the
shape and delete the rest — the conventions in `AGENTS.md` describe the shape,
not the domain.
