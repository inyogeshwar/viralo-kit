import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

import { env } from "@/lib/env";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

const isMock = env.mockMode || !env.databaseUrl;

let db: Db | null = null;

export function getDb(): Db | null {
  if (isMock) {
    return null;
  }
  if (!db) {
    const sql = neon(env.databaseUrl);
    db = drizzle<typeof schema>(sql, { schema });
  }
  return db;
}

export { schema };
