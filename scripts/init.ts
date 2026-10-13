import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

/**
 * Renames the template into a real project. Run once, after `pnpm install`,
 * from the repository root:
 *
 *   pnpm init:project my-new-project
 *
 * Every text file in the repo is scanned rather than a hand-maintained list, so
 * a file added to the template later cannot be silently missed.
 */

const TEMPLATE_NAME = "ai-ts-base";
const TEMPLATE_DB = "ai_ts_base";
const TEMPLATE_TEST_DB = "ai_ts_base_test";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

/** Directories never worth walking into. */
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".vite", "generated"]);

/**
 * Files excluded from the rewrite. The lockfile is excluded because
 * `pnpm install` regenerates it.
 */
const SKIP_FILES = new Set(["pnpm-lock.yaml", ".DS_Store", ".env"]);

/** Extensions treated as text. Anything else is left alone. */
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".yml",
  ".yaml",
  ".toml",
  ".html",
  ".css",
  ".svg",
  ".txt",
  ".sh",
  ".example",
]);

function fail(message: string): never {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

function run(command: string, args: string[]): void {
  execFileSync(command, args, { cwd: repoRoot, stdio: "inherit" });
}

const rawName = process.argv[2];

if (!rawName) {
  fail("Usage: pnpm init:project <project-name>");
}

const projectName = rawName.trim();

if (!/^[a-z0-9][a-z0-9._-]*$/i.test(projectName)) {
  fail(`"${projectName}" is not a usable project name. Use letters, digits, ".", "_" or "-".`);
}

/** `My New App` -> `my_new_app`, for the Postgres database name. */
const dbName = projectName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

if (!dbName) {
  fail(`"${projectName}" does not contain any characters usable in a database name.`);
}

const packageJsonPath = join(repoRoot, "package.json");
const currentName = (JSON.parse(readFileSync(packageJsonPath, "utf8")) as { name?: string }).name;

if (currentName !== TEMPLATE_NAME) {
  fail(
    `This does not look like a fresh clone: package.json is named "${currentName}", not "${TEMPLATE_NAME}". ` +
      "init:project only runs once, on the template.",
  );
}

console.log(`\n  Renaming ${TEMPLATE_NAME} -> ${projectName} (database: ${dbName})\n`);

/** Longest first, so `ai_ts_base_test` is not clobbered by `ai_ts_base`. */
const replacements: Array<[string, string]> = [
  [TEMPLATE_TEST_DB, `${dbName}_test`],
  [TEMPLATE_DB, dbName],
  [TEMPLATE_NAME, projectName],
];

function isTextFile(path: string): boolean {
  const lastDot = path.lastIndexOf(".");
  const extension = lastDot === -1 ? "" : path.slice(lastDot);

  if (TEXT_EXTENSIONS.has(extension)) {
    return true;
  }

  // Dotfiles like `.env.example` carry no useful extension; sniff for NUL bytes
  // so a stray binary is never rewritten.
  if (!extension || path.endsWith(".example")) {
    return !readFileSync(path).subarray(0, 8000).includes(0);
  }

  return false;
}

function walk(directory: string, onFile: (path: string) => void): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(join(directory, entry.name), onFile);
      }
    } else if (entry.isFile()) {
      onFile(join(directory, entry.name));
    }
  }
}

let changed = 0;

walk(repoRoot, (path) => {
  const name = path.slice(path.lastIndexOf("/") + 1);
  if (SKIP_FILES.has(name) || !isTextFile(path)) {
    return;
  }

  const original = readFileSync(path, "utf8");
  let updated = original;
  for (const [from, to] of replacements) {
    updated = updated.split(from).join(to);
  }

  if (updated !== original) {
    writeFileSync(path, updated);
    changed += 1;
    console.log(`  updated ${relative(repoRoot, path)}`);
  }
});

console.log(`\n  ${changed} file${changed === 1 ? "" : "s"} updated.`);

// The design document describes the template, not the project built from it.
const specDir = join(repoRoot, "docs", "superpowers");
if (existsSync(specDir)) {
  rmSync(specDir, { recursive: true, force: true });
  console.log("  removed docs/superpowers (template design notes)");
}

// The rename is the project's first commit, so the template's history goes.
const gitDir = join(repoRoot, ".git");
if (existsSync(gitDir) && statSync(gitDir).isDirectory()) {
  rmSync(gitDir, { recursive: true, force: true });
  console.log("  removed the template's git history");
}

run("git", ["init", "-q"]);
run("git", ["add", "-A"]);
run("git", ["commit", "-q", "-m", `Initial commit from ${TEMPLATE_NAME}`]);

console.log(`
  Done. Next:

    cp .env.example .env
    pnpm db:up && pnpm db:push
    pnpm dev          # API on :3000, frontend on :5173
    pnpm worker       # in a second terminal, for background jobs

`);
