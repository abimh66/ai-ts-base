import { z } from "zod";

/**
 * The list route's URL state. `q` stays optional so it only appears in the URL
 * when set; `status` is defaulted and stripped, so `/notes` stays clean.
 */
export const noteSearchSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["Draft", "Enriching", "Enriched"]).optional(),
});

export type NoteSearch = z.infer<typeof noteSearchSchema>;

export interface ResolvedNoteSearch {
  q: string | undefined;
  status: "Draft" | "Enriching" | "Enriched" | undefined;
}

/**
 * Normalises raw search params into the shape the list query wants: empty
 * strings read as "no filter" rather than as a search for nothing.
 */
export function resolveNoteSearch(search: NoteSearch): ResolvedNoteSearch {
  const q = search.q?.trim();
  return {
    q: q ? q : undefined,
    status: search.status,
  };
}
