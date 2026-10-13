import { z } from "zod";

export const noteStatusSchema = z.enum(["Draft", "Enriching", "Enriched"]);

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  body: z.string().trim().min(1, "Body is required"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200).optional(),
    body: z.string().trim().min(1, "Body is required").optional(),
    status: noteStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/**
 * List filters. `q` is a case-insensitive substring match over title and body;
 * both fields are optional, so an unfiltered list is the empty object.
 */
export const listNotesQuerySchema = z.object({
  status: noteStatusSchema.optional(),
  q: z.string().trim().min(1).optional(),
});

export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
