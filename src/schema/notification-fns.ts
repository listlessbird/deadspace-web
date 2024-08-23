import { db } from "@/db"
import { getPostById } from "@/schema/db-fns"
import { notificationsTable } from "@/schema"
import { User } from "lucia"

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
