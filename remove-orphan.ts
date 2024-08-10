import { UTApi } from "uploadthing/server"

import postgres from "postgres"
import * as schema from "./src/schema/index"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { sql } from "drizzle-orm"

dotenv.config()

const client = postgres(process.env.DB_URL!, { max: 1 })
export const db = drizzle(client, { schema })

const utApi = new UTApi({ logLevel: "info" })

function nonNullable<T>(value: T | null | undefined): value is NonNullable<T> {
  return value !== null && value !== undefined
}

async function run() {
  const res = await db
    .select({ attachmentUrl: schema.postAttachments.attachmentUrl })
    .from(schema.postAttachments)
    .where(sql`${schema.postAttachments.postId} is null`)

  const orphanUrls = res.map((r) => r.attachmentUrl).filter(nonNullable)
  console.log(orphanUrls)

  const orphans = orphanUrls
    .map((url) => url?.split("/").pop())
    .filter(nonNullable)
  console.log(orphans)

  if (orphans.length) {
    await utApi.deleteFiles(orphans).then((r) => {
      console.log(`Deleted ${orphans}`)
      console.log(`Deleted ${r.deletedCount} orphaned files`)
    })
  }
}

run()
