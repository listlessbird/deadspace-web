"use server"

import { validateRequest } from "@/auth"
import { getPostById, removePost } from "@/schema/db-fns"
import { PostPage } from "@/types"

export async function deletePost(postId: string) {
  const { user } = await validateRequest()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const post = await getPostById(postId)

  if (!post) throw new Error("Post not found")

  if (post.userId !== user.id) throw new Error("Unauthorized")

  await removePost(postId)

  return {
    ...post,
    username: user.username,
    avatarUrl: user.avatarUrl,
    displayName: user.displayName,
  } as PostPage["data"][number]
}
