"use server"

import { validateRequest } from "@/auth"
import { createPostBookmark, removeBookmark } from "@/schema/bookmark-fns"
import { revalidatePath } from "next/cache"

export async function bookmarkPostAction(postId: string) {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) throw Error("Unauthorized")

  try {
    await createPostBookmark(postId, currentUser.id).then(() =>
      revalidatePath("/bookmarks"),
    )
  } catch (error) {
    console.error("[PostBookmarkAction] Error liking the post", error)
  }
}

export async function removeBookmarkAction(postId: string) {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) throw Error("Unauthorized")

  try {
    await removeBookmark(postId).then(() => revalidatePath("/bookmarks"))
  } catch (error) {
    console.error("[RemoveBookmarkAction] Error disliking the post", error)
  }
}
