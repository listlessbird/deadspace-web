import { db } from "@/db"

import * as schema from "@/schema"
import { CommentType } from "@/types"
import { eq, sql, desc, and, lt } from "drizzle-orm"

export async function insertUserComment(
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
      agentId: null,
    })
    .returning({
      content: schema.commentsTable.content,
      id: schema.commentsTable.id,
      createdAt: schema.commentsTable.createdAt,
      updatedAt: schema.commentsTable.updatedAt,
      userId: schema.commentsTable.userId,
      agentId: schema.commentsTable.agentId,
    })

  return comment[0]
}

export async function insertReply(
  postId: string,
  parentId: string,
  userId: string,
  content: string,
) {
  const comment = await db
    .insert(schema.commentsTable)
    .values({
      content,
      userId,
      postId,
      parentId,
      agentId: null,
    })
    .returning({
      content: schema.commentsTable.content,
      id: schema.commentsTable.id,
      createdAt: schema.commentsTable.createdAt,
      updatedAt: schema.commentsTable.updatedAt,
      userId: schema.commentsTable.userId,
      parentId: schema.commentsTable.parentId,
      agentId: schema.commentsTable.agentId,
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

export async function getReplyCount(postId: string, commentId: string) {
  const count = await db.execute(
    sql<{ count: number }>`SELECT COUNT(*) as count FROM ${schema.commentsTable}
        where ${schema.commentsTable.postId} = ${postId}
        and ${schema.commentsTable.parentId} = ${commentId}
       `.mapWith(Number),
  )
  console.log("GET REPLY COUNT", count)
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
      agentId: schema.commentsTable.agentId,
      postId: schema.commentsTable.postId,
      username: sql<string>`COALESCE(
        ${schema.userTable.username}, ${schema.agentsTable.name}
      )`,
      displayName: sql<string>`COALESCE(
        ${schema.userTable.displayName}, ${schema.agentsTable.name}
      )`,
      content: schema.commentsTable.content,
      createdAt: schema.commentsTable.createdAt,
      updatedAt: schema.commentsTable.updatedAt,
      avatarUrl: sql<string>`COALESCE(
        ${schema.userTable.avatarUrl}, ${schema.agentsTable.avatarUrl}
      )`,
      parentId: schema.commentsTable.parentId,
      replyCount: sql<number>`(SELECT COUNT(*) FROM ${schema.commentsTable} AS replies WHERE replies.parent_id = ${schema.commentsTable.id})`,
    })
    .from(schema.commentsTable)
    .innerJoin(
      schema.postTable,
      eq(schema.commentsTable.postId, schema.postTable.id),
    )
    .leftJoin(
      schema.agentsTable,
      eq(schema.commentsTable.agentId, schema.agentsTable.id),
    )
    .leftJoin(
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

export async function getPaginatedReplies(
  postId: string,
  parentId: string,
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
      agentId: schema.commentsTable.agentId,
      postId: schema.commentsTable.postId,
      username: sql`COALESCE(${schema.userTable.username}, ${schema.agentsTable.name})`,
      displayName: sql`COALESCE(${schema.userTable.username}, ${schema.agentsTable.name})`,
      content: schema.commentsTable.content,
      createdAt: schema.commentsTable.createdAt,
      updatedAt: schema.commentsTable.updatedAt,
      avatarUrl: sql`COALESCE(${schema.userTable.avatarUrl}, ${schema.agentsTable.avatarUrl})`,
      parentId: schema.commentsTable.parentId,
      replyCount: sql<number>`(SELECT COUNT(*) FROM ${schema.commentsTable} AS replies WHERE replies.parent_id = ${schema.commentsTable.id})`,
    })
    .from(schema.commentsTable)
    .innerJoin(
      schema.postTable,
      eq(schema.commentsTable.postId, schema.postTable.id),
    )
    .leftJoin(
      schema.agentsTable,
      eq(schema.commentsTable.agentId, schema.agentsTable.id),
    )
    .leftJoin(
      schema.userTable,
      eq(schema.commentsTable.userId, schema.userTable.id),
    )
    .where(
      and(
        eq(schema.postTable.id, postId),
        eq(schema.commentsTable.parentId, parentId),
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

export async function getCommentById(commentId: string) {
  const comment = await db
    .select({
      id: schema.commentsTable.id,
      content: schema.commentsTable.content,
      userId: schema.commentsTable.userId,
      postId: schema.commentsTable.postId,
      parentId: schema.commentsTable.parentId,
      createdAt: schema.commentsTable.createdAt,
      updatedAt: schema.commentsTable.updatedAt,
      replyCount: sql<number>`(SELECT COUNT(*) FROM ${schema.commentsTable} AS replies WHERE replies.parent_id = ${schema.commentsTable.id})`,
    })
    .from(schema.commentsTable)
    .where(eq(schema.commentsTable.id, commentId))

  return comment[0]
}

export async function removeComment(commentId: string) {
  return await db
    .delete(schema.commentsTable)
    .where(eq(schema.commentsTable.id, commentId))
}
