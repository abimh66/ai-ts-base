import { createPrismaClient } from "../src/db.js";

/**
 * A couple of notes so the app has something to show on first run.
 * Safe to re-run: it only seeds an empty table.
 */
async function main() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run the seed");
  }

  const prisma = createPrismaClient(connectionString);
  try {
    const existing = await prisma.note.count();
    if (existing > 0) {
      console.log(`Skipped seed: ${existing} notes already present`);
      return;
    }

    await prisma.note.createMany({
      data: [
        {
          title: "Welcome to ai-ts-base",
          body: "This note is seeded. Open it, then press Enrich to send it through the worker and the AI gateway.",
        },
        {
          title: "Delete the example",
          body: "When a real domain arrives, remove apps/api/src/modules/note, apps/frontend/src/features/note, the note routes, and the Note model.",
        },
      ],
    });
    console.log("Seeded 2 notes");
  } finally {
    await prisma.$disconnect();
  }
}

await main();
