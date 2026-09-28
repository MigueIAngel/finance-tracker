import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema.js'

/**
 * In-memory PostgreSQL (PGlite, compiled to WebAssembly) for the public demo.
 * No external database is needed and every restart starts from fresh sample data,
 * so visitors can never see or leave real information.
 */
const DDL = `
  CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'savings');
  CREATE TYPE savings_plan_type AS ENUM ('monthly', 'goal');
  CREATE TABLE categories (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    type transaction_type NOT NULL,
    color text NOT NULL DEFAULT '#6366f1',
    created_at timestamp NOT NULL DEFAULT now()
  );
  CREATE TABLE savings_plans (
    id serial PRIMARY KEY,
    name text NOT NULL,
    type savings_plan_type NOT NULL,
    target_amount numeric(12, 2) NOT NULL,
    deadline timestamp,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
  );
  CREATE TABLE transactions (
    id serial PRIMARY KEY,
    amount numeric(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    category_id integer REFERENCES categories(id) ON DELETE SET NULL,
    savings_plan_id integer REFERENCES savings_plans(id) ON DELETE SET NULL,
    note text,
    date timestamp NOT NULL DEFAULT now(),
    created_at timestamp NOT NULL DEFAULT now()
  );
`

/**
 * Creating a cluster (initdb) is the most memory-hungry step, so the demo image does it once
 * at build time and ships the result as a snapshot (DEMO_DB_SNAPSHOT).
 */
export async function createDemoDb() {
  const snapshot = process.env.DEMO_DB_SNAPSHOT
  let client: PGlite
  if (snapshot && existsSync(snapshot)) {
    client = new PGlite({ loadDataDir: new Blob([readFileSync(snapshot)]) })
  } else {
    client = new PGlite()
    await client.exec(DDL)
  }
  return drizzle(client, { schema })
}

export async function writeDemoSnapshot(path: string) {
  const client = new PGlite()
  await client.exec(DDL)
  const archive = await client.dumpDataDir('gzip')
  writeFileSync(path, Buffer.from(await archive.arrayBuffer()))
  await client.close()
}
