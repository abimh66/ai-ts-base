import { Queue } from "bullmq";
import { connection, QUEUE_NAME } from "./queue-connection.js";

export interface AppQueue {
  enqueue(name: string, data?: unknown): Promise<void>;
}

export const appQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  },
});

export function createAppQueue(queue: Queue = appQueue): AppQueue {
  return {
    enqueue: async (name, data) => {
      await queue.add(name, data);
    },
  };
}
