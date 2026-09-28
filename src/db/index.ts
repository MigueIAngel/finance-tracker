import 'dotenv/config'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

type Database = PostgresJsDatabase<typeof schema>

/** `DATABASE_URL=pglite:memory` switches to the embedded database used by the public demo. */
export const isDemoDatabase = process.env.DATABASE_URL?.startsWith('pglite') ?? false

async function connect(): Promise<Database> {
  if (isDemoDatabase) {
    const { createDemoDb } = await import('./demo.js')
    // Both drivers expose the same Drizzle query builder for PostgreSQL.
    return (await createDemoDb()) as unknown as Database
  }
  return drizzle(postgres(process.env.DATABASE_URL!, { max: 10 }), { schema })
}

export const db = await connect()
