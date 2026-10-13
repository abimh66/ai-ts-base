import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageBody, PageHeader, PageScroll } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { notesQueryOptions, resolveNoteSearch, noteSearchSchema } from "@/features/note";
import { NoteForm } from "@/features/note/components/note-form";
import { NoteList } from "@/features/note/components/note-list";

export const Route = createFileRoute("/_app/notes/")({
  validateSearch: noteSearchSchema,
  // The list filters are the loader's inputs, so the loader re-runs when the
  // URL changes and the component reads the same query options from cache.
  loaderDeps: ({ search }) => resolveNoteSearch(search),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(notesQueryOptions(deps)),
  pendingComponent: NotesSkeleton,
  component: NotesPage,
});

function NotesHeader({ onCreated }: { onCreated?: (noteId: string) => void }) {
  return (
    <PageHeader
      breadcrumbs={[{ label: "Notes" }]}
      title="Notes"
      description="Everything you have written, and what the AI made of it."
      actions={<NoteForm onCreated={onCreated} />}
    />
  );
}

function NotesSkeleton() {
  return (
    <>
      <NotesHeader />
      <PageScroll>
        <PageBody>
          <Skeleton className="h-72 w-full" />
        </PageBody>
      </PageScroll>
    </>
  );
}

function NotesPage() {
  const { q, status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const resolved = resolveNoteSearch({ q, status });

  return (
    <>
      <NotesHeader
        onCreated={(noteId) => void navigate({ to: "/notes/$noteId", params: { noteId } })}
      />
      <PageScroll>
        <PageBody>
          <NoteList
            q={resolved.q}
            status={resolved.status}
            onSearch={(next) =>
              void navigate({ search: (prev) => ({ ...prev, q: next }), replace: true })
            }
            onFilter={(next) =>
              void navigate({ search: (prev) => ({ ...prev, status: next }), replace: true })
            }
          />
        </PageBody>
      </PageScroll>
    </>
  );
}
