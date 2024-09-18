import { db } from "@/db"
import { bookMarksTable, postTable } from "@/schema"
import { getPaginatedBasePostQuery } from "@/schema/db-fns"
import { sql, eq } from "drizzle-orm"

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

export async function getPaginatedBookmarks(
  currentUserId: string,
  cursor: string | undefined,
  perPage: number = 10,
) {
  let cdate: Date | undefined

  if (cursor) {
    const [, cursorDate] = cursor.split(":")
    cdate = new Date(cursorDate)
  }

  const q = getPaginatedBasePostQuery(currentUserId)
    .where(eq(bookMarksTable.userId, currentUserId))
    .limit(perPage)

  const bookmarks = await q

  const nextCursor =
    bookmarks.length === perPage
      ? `${bookmarks[perPage - 1].id}:${bookmarks[perPage - 1].createdAt}`
      : null

  return {
    data: bookmarks,
    nextCursor,
  }
}
