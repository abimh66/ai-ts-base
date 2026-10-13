import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNotesSuspense, type NoteStatus } from "@/features/note";
import { NoteStatusBadge } from "@/features/note/components/note-status-badge";
import { cn } from "cn";

const FILTERS: Array<{ label: string; value: NoteStatus | undefined }> = [
  { label: "All", value: undefined },
  { label: "Draft", value: "Draft" },
  { label: "Enriching", value: "Enriching" },
  { label: "Enriched", value: "Enriched" },
];

export interface NoteListProps {
  q: string | undefined;
  status: NoteStatus | undefined;
  onSearch: (q: string | undefined) => void;
  onFilter: (status: NoteStatus | undefined) => void;
}

export function NoteList({ q, status, onSearch, onFilter }: NoteListProps) {
  const { data: notes } = useNotesSuspense({ q, status });
  const [draft, setDraft] = useState(q ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="relative min-w-56 flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(draft.trim() ? draft.trim() : undefined);
          }}
        >
          <Icon
            icon={Search01Icon}
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search notes"
            className="pl-9"
            aria-label="Search notes"
          />
        </form>
        <div className="flex items-center gap-1">
          {FILTERS.map((filter) => (
            <Button
              key={filter.label}
              size="sm"
              variant={status === filter.value ? "secondary" : "ghost"}
              className={cn("h-8")}
              onClick={() => onFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {notes.length === 0 ? (
        <Card className="items-center gap-2 p-10 text-center">
          <p className="text-sm font-medium">No notes match this view</p>
          <p className="text-sm text-muted-foreground">
            {q || status
              ? "Try clearing the search or filter."
              : "Create your first note to begin."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              to="/notes/$noteId"
              params={{ noteId: note.id }}
              className="group rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-border hover:bg-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{note.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {note.summary ?? note.body}
                  </p>
                </div>
                <NoteStatusBadge status={note.status} />
              </div>
              {note.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
