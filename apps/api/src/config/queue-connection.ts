import type { ConnectionOptions } from "bullmq";

export const QUEUE_NAME = process.env["QUEUE_NAME"] || "default";

export const DEFAULT_REDIS_URL = "redis://localhost:16379";

/**
 * BullMQ takes connection options, not a URL, so the documented `REDIS_URL` is
 * parsed here into the shape it wants. `QUEUE_HOST` / `QUEUE_PORT` remain as
 * overrides for the rare case where a host/port pair is easier to inject than a
 * full URL.
 */
function parseRedisUrl(url: string): ConnectionOptions {
  const parsed = new URL(url);

  const options: ConnectionOptions = {
    host: parsed.hostname || "localhost",
    port: parsed.port ? Number(parsed.port) : 6379,
  };

  if (parsed.username) {
    options.username = decodeURIComponent(parsed.username);
  }
  if (parsed.password) {
    options.password = decodeURIComponent(parsed.password);
  }

  // A path of "/2" selects database 2; an empty path means the default.
  const db = parsed.pathname.replace(/^\//, "");
  if (db) {
    options.db = Number(db);
  }

  if (parsed.protocol === "rediss:") {
    options.tls = {};
  }

  return options;
}

const base = parseRedisUrl(process.env["REDIS_URL"] || DEFAULT_REDIS_URL);

export const connection: ConnectionOptions = {
  ...base,
  ...(process.env["QUEUE_HOST"] ? { host: process.env["QUEUE_HOST"] } : {}),
  ...(process.env["QUEUE_PORT"] ? { port: Number(process.env["QUEUE_PORT"]) } : {}),
};
