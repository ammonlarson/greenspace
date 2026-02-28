import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";

import type { Database } from "./types.js";

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export function createDatabase(config: DatabaseConfig): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: config.ssl ? { rejectUnauthorized: true } : undefined,
        max: 10,
      }),
    }),
  });
}
