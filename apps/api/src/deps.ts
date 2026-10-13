import { createOpenRouterAiGateway } from "./ai/openrouter-gateway.js";
import type { AppDeps } from "./app.js";
import { createAppQueue } from "./config/queue.js";
import { createPrismaClient } from "./db.js";

export function createDeps(): AppDeps {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to start the API");
  }

  return {
    prisma: createPrismaClient(connectionString),
    ai: createOpenRouterAiGateway(),
    queue: createAppQueue(),
  };
}
