import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestPrismaClient, truncateAll } from "../../db.js";
import { HttpError } from "../../lib/http-error.js";
import {
  applyEnrichment,
  createNote,
  deleteNote,
  getNote,
  listNotes,
  markEnriching,
  revertEnrichment,
  updateNote,
} from "./service.js";

const prisma = createTestPrismaClient();

beforeEach(async () => {
  await truncateAll(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("note service", () => {
  it("creates a note in Draft", async () => {
    const note = await createNote(prisma, { title: "First", body: "Body" });
    expect(note.status).toBe("Draft");
    expect(note.tags).toEqual([]);
    expect(note.summary).toBeNull();
  });

  it("lists notes most recently updated first", async () => {
    await createNote(prisma, { title: "Older", body: "a" });
    const newer = await createNote(prisma, { title: "Newer", body: "b" });
    await updateNote(prisma, newer.id, { body: "touched" });

    const notes = await listNotes(prisma, {});
    expect(notes.map((note) => note.title)).toEqual(["Newer", "Older"]);
  });

  it("filters by status", async () => {
    const draft = await createNote(prisma, { title: "Draft note", body: "a" });
    const other = await createNote(prisma, { title: "Enriched note", body: "b" });
    await applyEnrichment(prisma, other.id, { summary: "s", tags: ["t"] });

    const drafts = await listNotes(prisma, { status: "Draft" });
    expect(drafts.map((note) => note.id)).toEqual([draft.id]);
  });

  it("searches title and body case-insensitively", async () => {
    await createNote(prisma, { title: "Shopping list", body: "milk" });
    await createNote(prisma, { title: "Other", body: "buy MILK today" });

    const byTitle = await listNotes(prisma, { q: "shopping" });
    expect(byTitle).toHaveLength(1);
    expect(byTitle[0]?.title).toBe("Shopping list");

    const byBody = await listNotes(prisma, { q: "milk" });
    expect(byBody).toHaveLength(2);
  });

  it("throws 404 for a missing note", async () => {
    await expect(getNote(prisma, "nope")).rejects.toBeInstanceOf(HttpError);
    await expect(getNote(prisma, "nope")).rejects.toMatchObject({ status: 404 });
  });

  it("updates only the supplied fields", async () => {
    const note = await createNote(prisma, { title: "Keep", body: "original" });
    const updated = await updateNote(prisma, note.id, { title: "Changed" });
    expect(updated.title).toBe("Changed");
    expect(updated.body).toBe("original");
  });

  it("deletes a note and then 404s", async () => {
    const note = await createNote(prisma, { title: "Gone", body: "x" });
    await deleteNote(prisma, note.id);
    await expect(getNote(prisma, note.id)).rejects.toMatchObject({ status: 404 });
  });

  it("marks a note Enriching, then applies the result", async () => {
    const note = await createNote(prisma, { title: "Enrich me", body: "x" });
    await markEnriching(prisma, note.id);
    expect((await getNote(prisma, note.id)).status).toBe("Enriching");

    await applyEnrichment(prisma, note.id, { summary: "A summary", tags: ["a", "b"] });
    const enriched = await getNote(prisma, note.id);
    expect(enriched.status).toBe("Enriched");
    expect(enriched.summary).toBe("A summary");
    expect(enriched.tags).toEqual(["a", "b"]);
  });

  it("refuses to enrich a note that is already Enriching", async () => {
    const note = await createNote(prisma, { title: "Busy", body: "x" });
    await markEnriching(prisma, note.id);
    await expect(markEnriching(prisma, note.id)).rejects.toMatchObject({ status: 409 });
  });

  it("reverts an Enriching note to Draft", async () => {
    const note = await createNote(prisma, { title: "Failed", body: "x" });
    await markEnriching(prisma, note.id);
    await revertEnrichment(prisma, note.id);
    expect((await getNote(prisma, note.id)).status).toBe("Draft");
  });

  it("leaves an Enriched note alone when reverting", async () => {
    const note = await createNote(prisma, { title: "Done", body: "x" });
    await markEnriching(prisma, note.id);
    await applyEnrichment(prisma, note.id, { summary: "s", tags: [] });
    await revertEnrichment(prisma, note.id);
    expect((await getNote(prisma, note.id)).status).toBe("Enriched");
  });
});
