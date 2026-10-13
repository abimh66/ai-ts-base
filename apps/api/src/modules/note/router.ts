import { Hono } from "hono";
import type { Context } from "hono";
import { validator } from "hono/validator";
import type { AppEnv } from "../../app.js";
import { ENRICH_JOB } from "./jobs.js";
import { createNoteSchema, listNotesQuerySchema, updateNoteSchema } from "./schema.js";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  markEnriching,
  serializeNote,
  updateNote,
} from "./service.js";

function invalid(c: Context<AppEnv>, error: string, issues: { path: string; message: string }[]) {
  return c.json({ error, issues }, 400);
}

function toIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

export function createNoteRouter() {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const parsed = listNotesQuerySchema.safeParse(c.req.query());
      if (!parsed.success) {
        return invalid(c, "Invalid query", toIssues(parsed.error.issues));
      }
      const notes = await listNotes(c.get("deps").prisma, parsed.data);
      return c.json({ notes: notes.map(serializeNote) });
    })
    .post(
      "/",
      validator("json", (value, c) => {
        const parsed = createNoteSchema.safeParse(value);
        if (!parsed.success) {
          return invalid(c, "Invalid note", toIssues(parsed.error.issues));
        }
        return parsed.data;
      }),
      async (c) => {
        const note = await createNote(c.get("deps").prisma, c.req.valid("json"));
        return c.json(serializeNote(note), 201);
      },
    )
    .get("/:id", async (c) => {
      const note = await getNote(c.get("deps").prisma, c.req.param("id"));
      return c.json(serializeNote(note));
    })
    .patch(
      "/:id",
      validator("json", (value, c) => {
        const parsed = updateNoteSchema.safeParse(value);
        if (!parsed.success) {
          return invalid(c, "Invalid note", toIssues(parsed.error.issues));
        }
        return parsed.data;
      }),
      async (c) => {
        const note = await updateNote(c.get("deps").prisma, c.req.param("id"), c.req.valid("json"));
        return c.json(serializeNote(note));
      },
    )
    .delete("/:id", async (c) => {
      await deleteNote(c.get("deps").prisma, c.req.param("id"));
      return c.body(null, 204);
    })
    .post("/:id/enrich", async (c) => {
      const deps = c.get("deps");
      const note = await markEnriching(deps.prisma, c.req.param("id"));
      await deps.queue.enqueue(ENRICH_JOB, { noteId: note.id });
      return c.json(serializeNote(note), 202);
    });
}
