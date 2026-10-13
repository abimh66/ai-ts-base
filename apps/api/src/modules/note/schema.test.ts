import { describe, expect, it } from "vitest";
import { createNoteSchema, listNotesQuerySchema, updateNoteSchema } from "./schema.js";

describe("createNoteSchema", () => {
  it("accepts a title and body", () => {
    const parsed = createNoteSchema.parse({ title: "Hello", body: "World" });
    expect(parsed).toEqual({ title: "Hello", body: "World" });
  });

  it("trims surrounding whitespace", () => {
    const parsed = createNoteSchema.parse({ title: "  Hello  ", body: " World " });
    expect(parsed.title).toBe("Hello");
    expect(parsed.body).toBe("World");
  });

  it("rejects an empty or whitespace-only title", () => {
    expect(createNoteSchema.safeParse({ title: "", body: "x" }).success).toBe(false);
    expect(createNoteSchema.safeParse({ title: "   ", body: "x" }).success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    const result = createNoteSchema.safeParse({ title: "a".repeat(201), body: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty body", () => {
    expect(createNoteSchema.safeParse({ title: "x", body: "" }).success).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("accepts a partial update", () => {
    expect(updateNoteSchema.parse({ title: "New" })).toEqual({ title: "New" });
  });

  it("accepts a status change", () => {
    expect(updateNoteSchema.parse({ status: "Enriched" })).toEqual({ status: "Enriched" });
  });

  it("rejects an empty patch", () => {
    expect(updateNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(updateNoteSchema.safeParse({ status: "Done" }).success).toBe(false);
  });
});

describe("listNotesQuerySchema", () => {
  it("accepts an empty query", () => {
    expect(listNotesQuerySchema.parse({})).toEqual({});
  });

  it("accepts a status filter and a search term", () => {
    expect(listNotesQuerySchema.parse({ status: "Draft", q: "hello" })).toEqual({
      status: "Draft",
      q: "hello",
    });
  });

  it("rejects an unknown status", () => {
    expect(listNotesQuerySchema.safeParse({ status: "Archived" }).success).toBe(false);
  });
});
