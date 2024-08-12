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

export async function isThePostLikedByUser(postId: string, userId: string) {
  const isThePostLikedByUser = await db.execute(
    sql<{ isThePostLikedByUser: boolean }>`select exists(
                    select 1 
                        from 
                            ${postLikesTable}
                        where
                            ${postLikesTable.postId} = ${postId}
                         and
                             ${postLikesTable.userId} = ${userId}
                ) 
        as isThePostLikedByUser`.mapWith(Boolean),
  )

  return isThePostLikedByUser[0]["isThePostLikedByUser"] as boolean
}
