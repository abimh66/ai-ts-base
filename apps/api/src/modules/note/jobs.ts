/**
 * Job names shared between the API (which enqueues) and the worker (which
 * consumes). Kept in its own module so the worker never imports the router.
 */
export const ENRICH_JOB = "note.enrich";

export interface EnrichJobData {
  noteId: string;
}
