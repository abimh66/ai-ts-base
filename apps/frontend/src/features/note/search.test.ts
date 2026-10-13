import { describe, expect, it } from "vitest";
import { noteSearchSchema, resolveNoteSearch } from "./search.js";

describe("noteSearchSchema", () => {
  it("accepts an empty search", () => {
    expect(noteSearchSchema.parse({})).toEqual({});
  });

  it("accepts a query and a known status", () => {
    expect(noteSearchSchema.parse({ q: "milk", status: "Enriched" })).toEqual({
      q: "milk",
      status: "Enriched",
    });
  });

  it("rejects an unknown status", () => {
    expect(noteSearchSchema.safeParse({ status: "Archived" }).success).toBe(false);
  });
});

describe("resolveNoteSearch", () => {
  it("treats an absent query as no filter", () => {
    expect(resolveNoteSearch({})).toEqual({ q: undefined, status: undefined });
  });

  it("treats a blank query as no filter", () => {
    expect(resolveNoteSearch({ q: "   " }).q).toBeUndefined();
  });

  it("trims a real query", () => {
    expect(resolveNoteSearch({ q: "  milk  " }).q).toBe("milk");
  });

  it("passes the status through", () => {
    expect(resolveNoteSearch({ status: "Draft" }).status).toBe("Draft");
  });
});
