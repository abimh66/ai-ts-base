import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createUnavailableAiGateway, type AiGateway } from "../../ai/gateway.js";
import { createApp } from "../../app.js";
import type { AppQueue } from "../../config/queue.js";
import { createTestPrismaClient, truncateAll } from "../../db.js";
import { ENRICH_JOB } from "./jobs.js";
import { runEnrichNote } from "./pipeline.js";

const prisma = createTestPrismaClient();

function createStubQueue(): AppQueue & { jobs: Array<{ name: string; data: unknown }> } {
  const jobs: Array<{ name: string; data: unknown }> = [];
  return {
    jobs,
    enqueue: async (name, data) => {
      jobs.push({ name, data });
    },
  };
}

const stubAi: AiGateway = {
  enrich: async () => ({ summary: "A summary", tags: ["one", "two"] }),
};

let queue = createStubQueue();
let app = createApp({ prisma, ai: stubAi, queue });

beforeEach(async () => {
  await truncateAll(prisma);
  queue = createStubQueue();
  app = createApp({ prisma, ai: stubAi, queue });
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createNote(body: { title: string; body: string }) {
  const res = await app.request("/api/notes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { res, note: (await res.json()) as { id: string } };
}

describe("note router", () => {
  it("creates a note", async () => {
    const { res, note } = await createNote({ title: "Hello", body: "World" });
    expect(res.status).toBe(201);
    expect(note).toMatchObject({ title: "Hello", body: "World", status: "Draft" });
  });

  it("rejects an invalid body with 400 and issue paths", async () => {
    const res = await app.request("/api/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "", body: "x" }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { issues: { path: string }[] };
    expect(body.issues[0]?.path).toBe("title");
  });

  it("lists notes", async () => {
    await createNote({ title: "One", body: "a" });
    await createNote({ title: "Two", body: "b" });

    const res = await app.request("/api/notes");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { notes: unknown[] };
    expect(body.notes).toHaveLength(2);
  });

  it("filters the list by status", async () => {
    await createNote({ title: "One", body: "a" });
    const res = await app.request("/api/notes?status=Enriched");
    const body = (await res.json()) as { notes: unknown[] };
    expect(body.notes).toHaveLength(0);
  });

  it("rejects an unknown status filter", async () => {
    const res = await app.request("/api/notes?status=Bogus");
    expect(res.status).toBe(400);
  });

  it("reads a note by id and 404s an unknown one", async () => {
    const { note } = await createNote({ title: "Findable", body: "x" });
    const found = await app.request(`/api/notes/${note.id}`);
    expect(found.status).toBe(200);

    const missing = await app.request("/api/notes/does-not-exist");
    expect(missing.status).toBe(404);
  });

  it("patches a note", async () => {
    const { note } = await createNote({ title: "Before", body: "x" });
    const res = await app.request(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "After" }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()) as unknown).toMatchObject({ title: "After" });
  });

  it("deletes a note", async () => {
    const { note } = await createNote({ title: "Doomed", body: "x" });
    const res = await app.request(`/api/notes/${note.id}`, { method: "DELETE" });
    expect(res.status).toBe(204);
    expect((await app.request(`/api/notes/${note.id}`)).status).toBe(404);
  });

  it("enqueues enrichment and returns 202 with status Enriching", async () => {
    const { note } = await createNote({ title: "Enrich me", body: "x" });
    const res = await app.request(`/api/notes/${note.id}/enrich`, { method: "POST" });

    expect(res.status).toBe(202);
    expect((await res.json()) as unknown).toMatchObject({ status: "Enriching" });
    expect(queue.jobs).toEqual([{ name: ENRICH_JOB, data: { noteId: note.id } }]);
  });

  it("rejects enriching twice with 409", async () => {
    const { note } = await createNote({ title: "Enrich me", body: "x" });
    await app.request(`/api/notes/${note.id}/enrich`, { method: "POST" });
    const second = await app.request(`/api/notes/${note.id}/enrich`, { method: "POST" });
    expect(second.status).toBe(409);
  });

  it("404s enriching an unknown note", async () => {
    const res = await app.request("/api/notes/missing/enrich", { method: "POST" });
    expect(res.status).toBe(404);
  });

  it("answers the health check", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect((await res.json()) as unknown).toEqual({ ok: true });
  });
});

describe("enrich pipeline", () => {
  it("writes the summary and tags back and marks the note Enriched", async () => {
    const { note } = await createNote({ title: "Enrich me", body: "x" });
    await runEnrichNote({ prisma, ai: stubAi, queue }, { noteId: note.id });

    const res = await app.request(`/api/notes/${note.id}`);
    expect((await res.json()) as unknown).toMatchObject({
      status: "Enriched",
      summary: "A summary",
      tags: ["one", "two"],
    });
  });

  it("reverts to Draft instead of throwing when AI is unavailable", async () => {
    const { note } = await createNote({ title: "Enrich me", body: "x" });
    const deps = { prisma, ai: createUnavailableAiGateway(), queue };

    await expect(runEnrichNote(deps, { noteId: note.id })).resolves.toBeUndefined();

    const res = await app.request(`/api/notes/${note.id}`);
    expect((await res.json()) as unknown).toMatchObject({ status: "Draft", summary: null });
  });
});
