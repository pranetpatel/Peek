import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __peekDb?: Db;
};

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Supabase's pooled connection (port 6543, pgbouncer) doesn't support
  // prepared statements, so they're disabled here to stay compatible with it.
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

function getDb(): Db {
  if (!globalForDb.__peekDb) {
    globalForDb.__peekDb = createDb();
  }
  return globalForDb.__peekDb;
}

// Lazily connect so Next.js can collect page data at build time without
// requiring DATABASE_URL during module evaluation.
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
