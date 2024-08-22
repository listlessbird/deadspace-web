"use server"

import { validateRequest } from "@/auth"
import { getCommentById, removeComment } from "@/schema/comment-fns"
import { getPostById } from "@/schema/db-fns"
import { CommentType } from "@/types"

export async function deleteComment(commentId: string) {
  const { user } = await validateRequest()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const comment = await getCommentById(commentId)

  if (!comment) throw new Error("comment not found")

  if (comment.userId !== user.id) throw new Error("Unauthorized")

  await removeComment(commentId)

  return {
    ...comment,
    username: user.username,
    avatarUrl: user.avatarUrl,
    displayName: user.displayName,
  }
}
