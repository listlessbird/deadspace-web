import { db } from "@/db"

import * as schema from "@/schema"
import { eq, sql, desc, and, lt } from "drizzle-orm"

export async function insertComment(
  content: string,
  userId: string,
  postId: string,
) {
  const comment = await db
    .insert(schema.commentsTable)
    .values({
      content,
      userId,
      postId,
    })
    .returning({
      content: schema.commentsTable.content,
      id: schema.commentsTable.id,
      createdAt: schema.commentsTable.createdAt,
      updatedAt: schema.commentsTable.updatedAt,
      userId: schema.commentsTable.userId,
    })

  return comment[0]
}

export async function deleteComment(id: string) {
  return await db
    .delete(schema.commentsTable)
    .where(eq(schema.commentsTable.id, id))
}

export async function updateComment(id: string, content: string) {
  return await db
    .update(schema.commentsTable)
    .set({
      content,
    })
    .where(eq(schema.commentsTable.id, id))
}

// don't need to count nested comments?
export async function getCommentsCount(postId: string) {
  const count = await db.execute(
    sql<{ count: number }>`SELECT COUNT(*) as count FROM ${schema.commentsTable}
        where ${schema.commentsTable.postId} = ${postId}
        and ${schema.commentsTable.parentId} is null
       `.mapWith(Number),
  )

  return count[0].count as number
}

export async function getPaginatedComments(
  currentUserId: string,
  postId: string,
  cursor: string | undefined,
  perPage: number = 5,
) {
  let cdate: Date | undefined

  if (cursor) {
    const separatorIndex = cursor.indexOf(":")
    const cursorDate = cursor.substring(separatorIndex + 1)
    cdate = new Date(cursorDate)
  }

  const q = await db
    .select({
      id: schema.commentsTable.id,
      userId: schema.commentsTable.userId,
      postId: schema.commentsTable.postId,
      username: schema.userTable.username,
      displayName: schema.userTable.displayName,
      content: schema.commentsTable.content,
      createdAt: schema.commentsTable.createdAt,
      updatedAt: schema.commentsTable.updatedAt,
      avatarUrl: schema.userTable.avatarUrl,
    })
    .from(schema.commentsTable)
    .innerJoin(
      schema.postTable,
      eq(schema.commentsTable.postId, schema.postTable.id),
    )
    .innerJoin(
      schema.userTable,
      eq(schema.commentsTable.userId, schema.userTable.id),
    )
    .where(
      and(
        eq(schema.postTable.id, postId),
        cdate ? lt(schema.commentsTable.createdAt, cdate) : undefined,
      ),
    )
    .limit(perPage)
    .orderBy(desc(schema.commentsTable.createdAt))

  const nextCursor =
    q.length === perPage
      ? `${q[perPage - 1].id}:${q[perPage - 1].createdAt}`
      : null

  return {
    data: q,
    nextCursor,
  }
}
