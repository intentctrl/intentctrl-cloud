import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./index";

export type DB = NodePgDatabase<typeof schema>;

export function createClient(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl, max: 20 });

  const db = drizzle(pool, { schema });

  return { db, pool };
}
