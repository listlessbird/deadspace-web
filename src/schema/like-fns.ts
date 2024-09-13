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
    sql<{ post_liked_by_user: boolean }>`select exists(
                    select 1 
                        from 
                            ${postLikesTable}
                        where
                            ${postLikesTable.postId} = ${postId}
                         and
                             ${postLikesTable.userId} = ${userId}
                ) 
        as post_liked_by_user`.mapWith(Boolean),
  )
  return isThePostLikedByUser[0]["post_liked_by_user"] as boolean
}

export async function getPostLikeCount(postId: string) {
  const postLikes = await db.execute(
    sql<{ post_likes: number }>`
          select count(${postLikesTable.postId}) as post_likes
          from ${postLikesTable}
          where ${postLikesTable.postId} = ${postId}        
        `.mapWith(Number),
  )
  return postLikes[0]["post_likes"] as number
}
