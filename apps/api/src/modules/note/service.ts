import type { Note, PrismaClient } from "../../generated/prisma/client.js";
import { HttpError } from "../../lib/http-error.js";
import type { CreateNoteInput, ListNotesQuery, UpdateNoteInput } from "./schema.js";

/** The wire shape. Dates cross the boundary as ISO strings, never Date objects. */
export interface NoteDto {
  id: string;
  title: string;
  body: string;
  status: "Draft" | "Enriching" | "Enriched";
  summary: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function serializeNote(note: Note): NoteDto {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    status: note.status,
    summary: note.summary,
    tags: note.tags,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export async function listNotes(prisma: PrismaClient, query: ListNotesQuery): Promise<Note[]> {
  return prisma.note.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { body: { contains: query.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNote(prisma: PrismaClient, id: string): Promise<Note> {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) {
    throw new HttpError(404, "Note not found");
  }
  return note;
}

export async function createNote(prisma: PrismaClient, input: CreateNoteInput): Promise<Note> {
  return prisma.note.create({
    data: { title: input.title, body: input.body },
  });
}

export async function updateNote(
  prisma: PrismaClient,
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  await getNote(prisma, id);
  return prisma.note.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });
}

export async function deleteNote(prisma: PrismaClient, id: string): Promise<void> {
  await getNote(prisma, id);
  await prisma.note.delete({ where: { id } });
}

/**
 * Claims a note for enrichment. Rejects a note that is already Enriching so a
 * double-click cannot queue the same work twice.
 */
export async function markEnriching(prisma: PrismaClient, id: string): Promise<Note> {
  const note = await getNote(prisma, id);
  if (note.status === "Enriching") {
    throw new HttpError(409, "Note is already being enriched");
  }
  return prisma.note.update({ where: { id }, data: { status: "Enriching" } });
}

export async function applyEnrichment(
  prisma: PrismaClient,
  id: string,
  result: { summary: string; tags: string[] },
): Promise<Note> {
  return prisma.note.update({
    where: { id },
    data: { summary: result.summary, tags: result.tags, status: "Enriched" },
  });
}

/**
 * Returns a note to Draft after a failed enrichment. Without this the note
 * would sit in Enriching forever and the UI would poll indefinitely.
 */
export async function revertEnrichment(prisma: PrismaClient, id: string): Promise<void> {
  await prisma.note.updateMany({
    where: { id, status: "Enriching" },
    data: { status: "Draft" },
  });
}
