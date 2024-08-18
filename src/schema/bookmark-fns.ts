import { db } from "@/db"
import { bookMarksTable, postLikesTable } from "@/schema"
import { sql } from "drizzle-orm"

export async function isThePostBookmarkedByUser(
  postId: string,
  userId: string,
) {
  const isThePostBookmarkedByUser = await db.execute(
    sql<{ post_bookmarked_by_user: boolean }>`select exists(
                    select 1 
                        from 
                            ${bookMarksTable}
                        where
                            ${bookMarksTable.postId} = ${postId}
                         and
                             ${bookMarksTable.userId} = ${userId}
                ) 
        as post_bookmarked_by_user`.mapWith(Boolean),
  )
  console.log(isThePostBookmarkedByUser)
  return isThePostBookmarkedByUser[0]["post_bookmarked_by_user"] as boolean
}

export async function getBookmarksCount(postId: string) {
  const bookmarks = await db.execute(
    sql<{ bookmarks: number }>`
          select count(${bookMarksTable.postId}) as post_likes
          from ${bookMarksTable}
          where ${bookMarksTable.postId} = ${postId}        
        `.mapWith(Number),
  )
  console.log(bookmarks)
  return bookmarks[0]["post_likes"] as number
}

export async function createPostBookmark(postId: string, userId: string) {
  const bookmark = await db
    .insert(bookMarksTable)
    .values({
      postId,
      userId,
    })
    .returning()

  return bookmark[0]
}

export async function removeBookmark(postId: string) {
  return await db.execute(
    sql`
        delete from ${bookMarksTable}
         where ${bookMarksTable.postId} = ${postId}
        `,
  )
}
