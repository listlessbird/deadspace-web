"use server"

import { validateRequest } from "@/auth"
import { createPostLike, dislikePost } from "@/schema/like-fns"
import { createPostLikeNotification } from "@/schema/notification-fns"

export async function likePostAction(postId: string) {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) throw Error("Unauthorized")

  try {
    await createPostLike(postId, currentUser.id).then(() => {
      createPostLikeNotification(postId, currentUser)
    })
  } catch (error) {
    console.error("[PostLikeAction] Error liking the post", error)
  }
}

export async function dislikePostAction(postId: string) {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) throw Error("Unauthorized")

  try {
    await dislikePost(postId)
  } catch (error) {
    console.error("[DisLikePostAction] Error disliking the post", error)
  }
}
