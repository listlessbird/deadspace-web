"use server"

import { validateRequest } from "@/auth"
import { createCommentSchema } from "@/lib/validations"
import { insertUserComment } from "@/schema/comment-fns"
import { getPostById } from "@/schema/db-fns"
import { createPostCommentNotification } from "@/schema/notification-fns"
import { CommentsPage } from "@/types"

export async function createCommentAction({
  content,
  postId,
}: {
  content: string
  postId: string
}) {
  const { user } = await validateRequest()

  if (!user) throw Error("Unauthorized")

  const post = await getPostById(postId)

  if (!post) throw new Error("Post not found")

  const { content: parsedContent } = createCommentSchema.parse({ content })

  const newComment = await insertUserComment(
    parsedContent,
    user.id,
    postId,
  ).then((res) => {
    createPostCommentNotification(postId, user)
    return res
  })
  const data = {
    ...newComment,
    username: user.username,
    displayName: user.displayName!,
    avatarUrl: user.avatarUrl!,
    postId: postId,
    replyCount: 0,
    parentId: null,
  } satisfies CommentsPage["data"][number]

  return data
}
