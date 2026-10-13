import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  createNote,
  deleteNote,
  enrichNote,
  noteKeys,
  noteQueryOptions,
  notesQueryOptions,
  updateNote,
} from "./api";
import type { CreateNoteInput, ListNotesParams, Note, UpdateNoteInput } from "./types";

/**
 * Non-suspending list read, for chrome that renders outside a route loader
 * (the sidebar) and must not block on data.
 */
export function useNotes(params: ListNotesParams = {}) {
  return useQuery(notesQueryOptions(params));
}

/**
 * Suspending list read for route components. The route's loader has already
 * called `ensureQueryData` with the same options, so this resolves from cache
 * on first render.
 */
export function useNotesSuspense(params: ListNotesParams = {}) {
  return useSuspenseQuery(notesQueryOptions(params));
}

/**
 * Suspending detail read. `refetchInterval` polls only while the worker is
 * mid-flight, so an idle detail page makes no requests.
 */
export function useNoteSuspense(noteId: string) {
  return useSuspenseQuery({
    ...noteQueryOptions(noteId),
    refetchInterval: (query) => (query.state.data?.status === "Enriching" ? 1500 : false),
  });
}

/** Invalidates every note list, since any write can change list contents. */
function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: noteKeys.all });
}

export function useCreateNote(): UseMutationResult<Note, Error, CreateNoteInput> {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: createNote,
    onSuccess: invalidate,
  });
}

export function useUpdateNote(noteId: string): UseMutationResult<Note, Error, UpdateNoteInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNote(noteId, input),
    onSuccess: (note) => {
      queryClient.setQueryData(noteKeys.detail(noteId), note);
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useDeleteNote(): UseMutationResult<void, Error, string> {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: invalidate,
  });
}

/**
 * Enqueues enrichment. The response is the note in Enriching, which is written
 * straight into the cache so the detail page starts polling immediately.
 */
export function useEnrichNote(noteId: string): UseMutationResult<Note, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => enrichNote(noteId),
    onSuccess: (note) => {
      queryClient.setQueryData(noteKeys.detail(noteId), note);
    },
  });
}
