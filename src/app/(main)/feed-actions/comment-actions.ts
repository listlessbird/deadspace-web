"use server"

import { validateRequest } from "@/auth"
import { createCommentSchema } from "@/lib/validations"
import { insertComment } from "@/schema/comment-fns"
import { getPostById } from "@/schema/db-fns"

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

  const { content: parsedContent } = createCommentSchema.parse(content)

  const newComment = await insertComment(parsedContent, user.id, postId)

  return newComment
}
