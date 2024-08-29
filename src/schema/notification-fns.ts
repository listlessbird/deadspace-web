import { db } from "@/db"
import { getPostById, getUserByUsername } from "@/schema/db-fns"
import { notificationsTable } from "@/schema"
import { User } from "lucia"
import { CommentType } from "@/types"
import { getCommentById } from "@/schema/comment-fns"

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

  const notification = await db
    .insert(notificationsTable)
    .values({
      type: "mention",
      resourceId,
      content: `@${mentionedBy.username} mentioned you in a ${mentionType}[${resourceId}]`,
      recipientId: recipient,
    })
    .returning()

  return notification[0]
}
