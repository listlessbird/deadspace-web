"use server"

import { validateRequest } from "@/auth"
import { db } from "@/db"
import { createPostSchema } from "@/lib/validations"
import { schema } from "@/schema"
import { sql } from "drizzle-orm"

export async function submitPost(content: string) {
  const { user } = await validateRequest()

  if (!user) throw Error("Unauthorized")

  const { content: parsedContent } = createPostSchema.parse({ content })

  await db
    .execute(
      sql`insert into ${schema.postTable} (content,user_id) values (${parsedContent}, ${user.id})`,
    )
    .execute()
}
