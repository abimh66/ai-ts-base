# ai-ts-base

A small note-taking app, used as the template's worked example. A note is written, optionally enriched by an AI worker into a summary and tags, and read back through a list with search and status filters.

## Language

**Note**:
A single piece of writing: a title and a body, plus whatever enrichment produced. A Note is `Draft` when written, `Enriching` while a worker is processing it, and `Enriched` once a summary and tags exist. Enrichment is additive — it never edits the title or body the author wrote.
_Avoid_: Document, entry, item, memo

**Enrichment**:
The AI-derived addition to a Note: a short `summary` and a set of `tags`. It is a derived value, so it can be discarded and recomputed without losing anything the author wrote — which is why a failed enrichment reverts a Note to `Draft` rather than leaving it in a broken state.
_Avoid_: Analysis, processing, tagging

**Worker**:
The separate process (`apps/api/src/worker.ts`) that consumes queued jobs over BullMQ + Redis. The API only ever enqueues; all long-running work happens in the Worker, so a slow model call cannot occupy a request.
_Avoid_: Background job, cron, daemon

**Gateway**:
The seam (`src/ai/gateway.ts`) between the domain and the model provider. The app depends on the `AiGateway` interface, never on the SDK. This is what lets the whole template run with no API key: an unavailable implementation satisfies the interface and fails in a defined way.
_Avoid_: Client, provider, adapter
