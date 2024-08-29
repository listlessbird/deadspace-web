import { db } from "@/db"
import { getPostById, getUserByUsername } from "@/schema/db-fns"
import { notificationsTable, userTable } from "@/schema"
import { User } from "lucia"
import { CommentType } from "@/types"
import { getCommentById } from "@/schema/comment-fns"
import { aliasedTable, and, count, desc, eq, lt } from "drizzle-orm"

export async function createPostLikeNotification(
  postId: string,
  likedByUser: User,
) {
  const post = await getPostById(postId)

  if (!post) {
    console.error("[createLikeNotification] Post not found", { postId })
    return
  }

  const recipient = post.userId

  if (recipient === likedByUser.id) {
    console.info("[createLikeNotification] User liked their own post")
    return
  }

  const notification = await db
    .insert(notificationsTable)
    .values({
      type: "post-like",
      resourceId: postId,
      content: `Your post was liked by @${likedByUser.username}`,
      recipientId: recipient,
      issuerId: likedByUser.id,
    })
    .returning()

  return notification[0]
}

export async function createPostCommentNotification(
  postId: string,
  commentCreatedBy: User,
) {
  const post = await getPostById(postId)

  if (!post) {
    console.error("[createPostCommentNotification] Post not found", { postId })
    return
  }

  const recipient = post.userId

  if (recipient === commentCreatedBy.id) {
    console.info(
      "[createPostCommentNotification] User commented on their own post",
    )
    return
  }

  const notification = await db
    .insert(notificationsTable)
    .values({
      type: "post-comment",
      resourceId: postId,
      content: `@${commentCreatedBy.username} made a comment on your post`,
      recipientId: recipient,
      issuerId: commentCreatedBy.id,
    })
    .returning()

  return notification[0]
}

export async function createCommentReplyNotification(
  postId: string,
  reply: CommentType,
  parentId: string,
) {
  const post = await getPostById(postId)

  if (!post) {
    console.error("[createPostCommentNotification] Post not found", { postId })
    return
  }

  const parent = await getCommentById(parentId)

  if (!parent) {
    console.error("[createPostCommentNotification] Parent comment not found", {
      parentId,
    })
    return
  }

  const recipient = parent.userId

  if (recipient === reply.userId) {
    console.info(
      "[createPostCommentNotification] User replied to their own comment",
    )
    return
  }

  const notification = await db
    .insert(notificationsTable)
    .values({
      type: "comment-reply",
      // todo: build a link to the comment
      resourceId: postId,
      content: `@${reply.username} replied to your comment`,
      recipientId: recipient,
      issuerId: reply.userId,
    })
    .returning()

  return notification[0]
}

export async function createMentionNotification(
  resourceId: string,
  mentionType: "post" | "comment",
  mentionedBy: User,
  mentionedUser: string,
) {
  const mentionedUserItem = await getUserByUsername(mentionedUser)

  if (!mentionedUserItem) return

  const recipient = mentionedUserItem.id

  if (recipient === mentionedBy.id) {
    console.info("[createMentionNotification] User mentioned themselves")
    return
  }

  const notification = await db
    .insert(notificationsTable)
    .values({
      type: "mention",
      resourceId,
      content: `@${mentionedBy.username} mentioned you in a ${mentionType}[${resourceId}]`,
      recipientId: recipient,
      issuerId: mentionedBy.id,
    })
    .returning()

  return notification[0]
}

export async function getNotifications(userId: string) {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.read, false),
        eq(notificationsTable.recipientId, userId),
      ),
    )

  return notifications
}

export async function getPaginatedNotifications({
  userId,
  limit = 10,
  cursor,
}: {
  userId: string
  limit: number
  cursor?: string | null
}) {
  let c: Date | undefined

  if (cursor) {
    c = new Date(cursor)
  }

  const issuerTable = aliasedTable(userTable, "issuer")

  const notifications = await db
    .select({
      notification: notificationsTable,
      recipient: {
        id: userTable.id,
        username: userTable.username,
        displayName: userTable.displayName,
        avatarUrl: userTable.avatarUrl,
      },
      issuer: {
        id: issuerTable.id,
        username: issuerTable.username,
        displayName: issuerTable.displayName,
        avatarUrl: issuerTable.avatarUrl,
      },
    })
    .from(notificationsTable)
    .leftJoin(userTable, eq(notificationsTable.recipientId, userTable.id))
    .leftJoin(issuerTable, eq(notificationsTable.issuerId, userTable.id))
    .where(
      and(
        eq(notificationsTable.recipientId, userId),
        c ? lt(notificationsTable.createdAt, c) : undefined,
      ),
    )
    .orderBy(desc(notificationsTable.createdAt))
    .limit(10)

  const hasNext = notifications.length === limit

  const nextCursor = hasNext
    ? `${notifications[notifications.length - 1].notification.createdAt?.toISOString()}`
    : null

  return {
    data: notifications,
    nextCursor,
  }
}

export async function markNotificationsAsRead(userId: string) {
  const read = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(
      and(
        eq(notificationsTable.recipientId, userId),
        eq(notificationsTable.read, false),
      ),
    )
    .returning()

  return read
}

export async function getUnreadNotificationCount(userId: string) {
  const c = await db
    .select({ count: count(notificationsTable.id) })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.recipientId, userId),
        eq(notificationsTable.read, false),
      ),
    )

  return c[0].count
}
