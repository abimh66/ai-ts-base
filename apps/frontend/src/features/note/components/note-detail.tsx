import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Delete02Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteNote,
  useEnrichNote,
  useNoteSuspense,
  useUpdateNote,
  NoteApiError,
} from "@/features/note";
import { NoteStatusBadge } from "@/features/note/components/note-status-badge";

/** Turns an API failure into the most specific message the user can act on. */
function enrichErrorMessage(error: unknown): string {
  if (error instanceof NoteApiError) {
    if (error.status === 409) {
      return "This note is already being enriched.";
    }
    if (error.status === 404) {
      return "This note no longer exists.";
    }
    return error.message;
  }
  return "Could not start enrichment.";
}

export function NoteDetail({ noteId }: { noteId: string }) {
  const navigate = useNavigate();
  const { data: note } = useNoteSuspense(noteId);
  const updateNote = useUpdateNote(noteId);
  const deleteNote = useDeleteNote();
  const enrichNote = useEnrichNote(noteId);

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(note.title);
  const [draftBody, setDraftBody] = useState(note.body);

  const isEnriching = note.status === "Enriching";

  function startEditing() {
    setDraftTitle(note.title);
    setDraftBody(note.body);
    setEditing(true);
  }

  async function save() {
    try {
      await updateNote.mutateAsync({ title: draftTitle.trim(), body: draftBody.trim() });
      setEditing(false);
      toast.success("Note saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the note");
    }
  }

  async function remove() {
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success("Note deleted");
      await navigate({ to: "/notes" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the note");
    }
  }

  async function enrich() {
    try {
      await enrichNote.mutateAsync();
      toast.success("Enrichment queued");
    } catch (error) {
      toast.error(enrichErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 p-0">
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                aria-label="Note title"
                className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : (
              <h2 className="text-lg font-semibold tracking-[-0.01em]">{note.title}</h2>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Updated {new Date(note.updatedAt).toLocaleString()}
            </p>
          </div>
          <NoteStatusBadge status={note.status} />
        </div>

        <Separator />

        <div className="p-5">
          {editing ? (
            <Textarea
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              rows={10}
              aria-label="Note body"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{note.body}</p>
          )}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2 p-5">
          {editing ? (
            <>
              <Button size="sm" onClick={() => void save()} disabled={updateNote.isPending}>
                {updateNote.isPending ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => void enrich()}
                disabled={isEnriching || enrichNote.isPending}
              >
                <Icon icon={SparklesIcon} size={16} />
                {isEnriching ? "Enriching…" : "Enrich with AI"}
              </Button>
              <Button size="sm" variant="outline" onClick={startEditing}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => void remove()}
                disabled={deleteNote.isPending}
              >
                <Icon icon={Delete02Icon} size={16} />
                Delete
              </Button>
            </>
          )}
        </div>
      </Card>

      {isEnriching ? (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Waiting for the worker. Make sure it is running with{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm worker</code>.
          </p>
        </Card>
      ) : null}

      {note.status === "Enriched" ? (
        <Card className="gap-3 p-5">
          <h3 className="text-sm font-semibold">AI summary</h3>
          <p className="text-sm text-muted-foreground">{note.summary}</p>
          {note.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      {note.status === "Draft" && !editing ? (
        <p className="px-1 text-xs text-muted-foreground">
          If enrichment leaves this note in Draft, no AI key is configured — set{" "}
          <code className="rounded bg-muted px-1 py-0.5">OPENROUTER_API_KEY</code> in{" "}
          <code className="rounded bg-muted px-1 py-0.5">.env</code> to enable it.
        </p>
      ) : null}
    </div>
  );
}
