import { createDatabase } from "./connection.js";
import { migrateToLatest } from "./migrate.js";
import { seed } from "./seed.js";
import { hashPassword } from "../lib/password.js";

const INITIAL_PASSWORD = process.env["SEED_ADMIN_PASSWORD"] ?? "changeme123";

async function main() {
  const db = createDatabase({
    host: process.env["DB_HOST"] ?? "localhost",
    port: Number(process.env["DB_PORT"] ?? "5432"),
    database: process.env["DB_NAME"] ?? "greenspace",
    user: process.env["DB_USER"] ?? "greenspace",
    password: process.env["DB_PASSWORD"] ?? "",
    ssl: process.env["DB_SSL"] === "true",
  });

  console.log("Running migrations...");
  const { executedMigrations } = await migrateToLatest(db);
  if (executedMigrations.length > 0) {
    console.log(`Applied: ${executedMigrations.join(", ")}`);
  } else {
    console.log("Already up to date.");
  }

  console.log("Seeding database...");
  await seed(db, hashPassword, INITIAL_PASSWORD);
  console.log("Seed complete.");

  await db.destroy();
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
