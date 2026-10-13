import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageScroll, PageTopBar } from "@/components/page-header";
import { loadOrNotFound } from "@/lib/loaders";
import { noteQueryOptions } from "@/features/note";
import { NoteDetail } from "@/features/note/components/note-detail";

export const Route = createFileRoute("/_app/notes/$noteId")({
  // A missing note becomes the router's not-found rather than a broken page.
  loader: ({ context, params }) =>
    loadOrNotFound(() => context.queryClient.ensureQueryData(noteQueryOptions(params.noteId))),
  component: NoteDetailPage,
});

function NoteDetailPage() {
  const { noteId } = Route.useParams();
  return (
    <>
      {/* No page title here: the note's own title heads the detail card. */}
      <PageTopBar breadcrumbs={[{ label: "Notes", to: "/notes" }, { label: "Note" }]} />
      <PageScroll>
        <PageBody>
          <NoteDetail noteId={noteId} />
        </PageBody>
      </PageScroll>
    </>
  );
}
