import postgres from "postgres"
import * as schema from "./schema"

import { drizzle } from "drizzle-orm/postgres-js"

const client = postgres(process.env.DB_URL!)
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development" ? true : false,
})
