import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { client } from "@/lib/api";
import type { CreateNoteInput, ListNotesParams, Note, UpdateNoteInput } from "./types";

export interface ApiIssue {
  path: string;
  message: string;
}

/** An API error that also carries the per-field validation issues, if any. */
export class NoteApiError extends ApiError {
  readonly issues: ApiIssue[];

  constructor(message: string, status: number, issues: ApiIssue[] = []) {
    super(message, status);
    this.name = "NoteApiError";
    this.issues = issues;
  }
}

async function readError(res: Response): Promise<NoteApiError> {
  try {
    const body = (await res.json()) as { error?: string; issues?: ApiIssue[] };
    return new NoteApiError(body.error ?? "Request failed", res.status, body.issues ?? []);
  } catch {
    return new NoteApiError("Request failed", res.status);
  }
}

/** Query keys are built here so every caller invalidates the same shapes. */
export const noteKeys = {
  all: ["notes"] as const,
  list: (params: ListNotesParams) => [...noteKeys.all, "list", params] as const,
  detail: (noteId: string) => [...noteKeys.all, "detail", noteId] as const,
};

export async function fetchNotes(params: ListNotesParams = {}): Promise<Note[]> {
  const res = await client.api.notes.$get({
    query: {
      ...(params.status ? { status: params.status } : {}),
      ...(params.q ? { q: params.q } : {}),
    },
  });
  if (!res.ok) {
    throw await readError(res);
  }
  const body = await res.json();
  return body.notes;
}

export async function fetchNote(noteId: string): Promise<Note> {
  const res = await client.api.notes[":id"].$get({ param: { id: noteId } });
  if (!res.ok) {
    throw await readError(res);
  }
  return res.json();
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const res = await client.api.notes.$post({ json: input });
  if (!res.ok) {
    throw await readError(res);
  }
  return res.json();
}

export async function updateNote(noteId: string, input: UpdateNoteInput): Promise<Note> {
  const res = await client.api.notes[":id"].$patch({ param: { id: noteId }, json: input });
  if (!res.ok) {
    throw await readError(res);
  }
  return res.json();
}

export async function deleteNote(noteId: string): Promise<void> {
  const res = await client.api.notes[":id"].$delete({ param: { id: noteId } });
  if (!res.ok) {
    throw await readError(res);
  }
}

export async function enrichNote(noteId: string): Promise<Note> {
  const res = await client.api.notes[":id"].enrich.$post({ param: { id: noteId } });
  if (!res.ok) {
    throw await readError(res);
  }
  return res.json();
}

/**
 * The single source of truth for a note list. Route loaders call
 * `ensureQueryData` on this and the component reads `useSuspenseQuery` off the
 * same options, so there is exactly one cache entry per set of filters.
 */
export function notesQueryOptions(params: ListNotesParams = {}) {
  return queryOptions({
    queryKey: noteKeys.list(params),
    queryFn: () => fetchNotes(params),
  });
}

export function noteQueryOptions(noteId: string) {
  return queryOptions({
    queryKey: noteKeys.detail(noteId),
    queryFn: () => fetchNote(noteId),
  });
}
