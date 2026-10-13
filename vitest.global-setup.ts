import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));

const DEFAULT_TEST_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:15432/ai_ts_base_test?schema=public";

function adminConnectionString(testUrl: string): string {
  const url = new URL(testUrl);
  url.pathname = "/postgres";
  url.search = "";
  return url.toString();
}

function databaseName(testUrl: string): string {
  const url = new URL(testUrl);
  return url.pathname.replace(/^\//, "");
}

export default async function setup(): Promise<void> {
  const testUrl = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
  const dbName = databaseName(testUrl);

  const client = new Client({ connectionString: adminConnectionString(testUrl) });
  await client.connect();
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await client.end();
  }

  execFileSync("pnpm", ["--filter", "api", "exec", "prisma", "db", "push"], {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
  });
}
