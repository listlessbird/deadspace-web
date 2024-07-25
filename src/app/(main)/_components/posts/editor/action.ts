"use server"

import { validateRequest } from "@/auth"
import { db } from "@/db"
import { createPostSchema } from "@/lib/validations"
import { schema } from "@/schema"
import { postInclude } from "@/schema/db-fns"
import { PostPage } from "@/types"
import { sql } from "drizzle-orm"

export async function submitPost(content: string) {
  const { user } = await validateRequest()

  if (!user) throw Error("Unauthorized")

  const { content: parsedContent } = createPostSchema.parse({ content })

  // const newPost = await db.execute(
  //   sql`insert into ${schema.postTable} (content,user_id) values (${parsedContent}, ${user.id})`,
  // )

  const newPost = await db
    .insert(schema.postTable)
    .values({
      userId: user.id,
      content: parsedContent,
    })
    .returning()

  const data = {
    ...newPost[0],
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }

  console.log(data)

  return data as PostPage["data"][0]
}
