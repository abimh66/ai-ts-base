import { z } from "zod";

/**
 * The AI's output contract for enriching a note. The schema is the source of
 * truth: the gateway passes it to the model as a structured-output schema, and
 * the inferred type is what the worker writes back onto the note.
 */
export const enrichSchema = z.object({
  summary: z.string().describe("One or two sentences capturing what the note says"),
  tags: z
    .array(z.string())
    .describe("Three to six short lowercase topical tags, without a leading '#'"),
});

export type EnrichResult = z.infer<typeof enrichSchema>;

export const ENRICH_INSTRUCTIONS = [
  "You summarise short personal notes.",
  "Stay faithful to the note's content: never invent facts, names, or dates.",
  "Write the summary in the same language as the note.",
  "Tags are single lowercase words or hyphenated phrases, not sentences.",
].join(" ");

export function buildEnrichPrompt(note: { title: string; body: string }): string {
  return ["Title:", note.title, "", "Body:", note.body].join("\n");
}
