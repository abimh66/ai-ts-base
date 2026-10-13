# `.scratch/`

Working notes for features in flight: specs, tickets, and the conversation
around them. Everything here is a markdown file — see
[`docs/agents/issue-tracker.md`](../docs/agents/issue-tracker.md) for the
conventions.

```
.scratch/<feature-slug>/
  spec.md
  issues/01-<slug>.md
  issues/02-<slug>.md
```

This directory is committed on purpose, and it starts empty. A spec that
describes why a feature is shaped the way it is stays useful long after the
feature ships; delete a folder only when its content has moved into an ADR or
into the code itself.
