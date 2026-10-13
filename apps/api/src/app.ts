import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AiGateway } from "./ai/gateway.js";
import type { AppQueue } from "./config/queue.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { HttpError } from "./lib/http-error.js";
import { createNoteRouter } from "./modules/note/router.js";

export interface AppDeps {
  prisma: PrismaClient;
  ai: AiGateway;
  queue: AppQueue;
}

export interface AppEnv {
  Variables: {
    deps: AppDeps;
  };
}

export function createApp(deps: AppDeps) {
  return new Hono<AppEnv>()
    .use("*", cors({ origin: process.env["FRONTEND_ORIGIN"] ?? "http://localhost:5173" }))
    .use("*", async (c, next) => {
      c.set("deps", deps);
      await next();
    })
    .basePath("/api")
    .onError((err, c) => {
      if (err instanceof HttpError) {
        return c.json({ error: err.message }, err.status);
      }
      console.error(err);
      return c.json({ error: "Internal server error" }, 500);
    })
    .get("/health", (c) => c.json({ ok: true }))
    .route("/notes", createNoteRouter());
}

/**
 * The frontend imports this type and calls the API through Hono's RPC client,
 * so a route change that breaks the contract fails the frontend typecheck.
 */
export type AppType = ReturnType<typeof createApp>;
