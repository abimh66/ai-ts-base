export type NoteStatus = "Draft" | "Enriching" | "Enriched";

export interface Note {
  id: string;
  title: string;
  body: string;
  status: NoteStatus;
  summary: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  body: string;
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
  status?: NoteStatus;
}

export interface ListNotesParams {
  status?: NoteStatus;
  q?: string;
}
