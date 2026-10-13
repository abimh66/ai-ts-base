import { Worker } from "bullmq";
import type { AppDeps } from "./app.js";
import { connection, QUEUE_NAME } from "./config/queue-connection.js";
import { createDeps } from "./deps.js";
import { ENRICH_JOB, type EnrichJobData } from "./modules/note/jobs.js";
import { runEnrichNote } from "./modules/note/pipeline.js";

/**
 * The worker process owns long-running work so the API can answer requests
 * without waiting on a model call. Run it alongside `pnpm dev`.
 */
export function createNoteWorker(
  deps: AppDeps,
  concurrency = Number(process.env["WORKER_CONCURRENCY"] ?? 4),
): Worker {
  return new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name === ENRICH_JOB) {
        await runEnrichNote(deps, job.data as EnrichJobData);
      }
    },
    { connection, concurrency },
  );
}

const worker = createNoteWorker(createDeps());
console.log(
  `Worker listening on queue "${QUEUE_NAME}" with concurrency ${worker.opts.concurrency}`,
);
