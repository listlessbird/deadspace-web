"use server"

import { validateRequest } from "@/auth"
import { createCommentSchema } from "@/lib/validations"
import { insertComment, insertReply } from "@/schema/comment-fns"
import { getPostById } from "@/schema/db-fns"
import { createCommentReplyNotification } from "@/schema/notification-fns"
import { CommentsPage } from "@/types"

export async function createReplyAction({
  content,
  postId,
  commentId,
}: {
  content: string
  postId: string
  commentId: string
}) {
  const { user } = await validateRequest()

  if (!user) throw Error("Unauthorized")

  const post = await getPostById(postId)

  if (!post) throw new Error("Post not found")

  const { content: parsedContent } = createCommentSchema.parse({ content })

  const newComment = await insertReply(
    postId,
    commentId,
    user.id,
    parsedContent,
  )

  const data = {
    ...newComment,
    username: user.username,
    displayName: user.displayName as string | null,
    avatarUrl: user.avatarUrl as string | null,
    postId: postId,
    replyCount: 0,
  } satisfies CommentsPage["data"][number]

  createCommentReplyNotification(postId, data, commentId)

  return data
}
