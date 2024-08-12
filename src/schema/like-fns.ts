import { db } from "@/db"
import { postLikesTable } from "@/schema"
import { sql } from "drizzle-orm"

export async function createPostLike(postId: string, userId: string) {
  const like = await db
    .insert(postLikesTable)
    .values({
      postId,
      userId,
    })
    .returning()

  return like[0]
}

export async function dislikePost(postId: string) {
  return await db.execute(
    sql`
        delete from ${postLikesTable}
         where ${postLikesTable.postId} = ${postId}
        `,
  )
}
