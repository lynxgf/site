import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  console.log("Pushing schema to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Push schema changes to the database
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Schema pushed successfully!");

  pool.end();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error pushing schema:", err);
    process.exit(1);
  });