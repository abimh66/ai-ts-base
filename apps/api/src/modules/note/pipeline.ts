import { AiUnavailableError } from "../../ai/gateway.js";
import type { AppDeps } from "../../app.js";
import type { EnrichJobData } from "./jobs.js";
import { applyEnrichment, getNote, revertEnrichment } from "./service.js";

/**
 * The enrich job body. Lives outside worker.ts so it can be tested without a
 * running queue, and so the worker file stays a thin registration shim.
 */
export async function runEnrichNote(deps: AppDeps, { noteId }: EnrichJobData): Promise<void> {
  const note = await getNote(deps.prisma, noteId);

  try {
    const result = await deps.ai.enrich({ title: note.title, body: note.body });
    await applyEnrichment(deps.prisma, noteId, result);
    console.log(`Enriched note ${noteId} with ${result.tags.length} tags`);
  } catch (error) {
    // Put the note back so the UI stops polling and the user can retry.
    await revertEnrichment(deps.prisma, noteId);
    if (error instanceof AiUnavailableError) {
      console.warn(`AI disabled, reverted note ${noteId}: ${error.message}`);
      return;
    }
    throw error;
  }
}
