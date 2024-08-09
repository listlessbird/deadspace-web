"use server"

import { validateRequest } from "@/auth"
import { createFollow, getUserById, removeFollow } from "@/schema/db-fns"

export async function follow(userId: string) {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) throw new Error("Unauthorized")
  // throw Error("test")
  try {
    // this is probably not needed but w.e
    const userExists = await getUserById(userId)

    if (!userExists) {
      console.error(`[FollowAction] user ${userId} doesnt exist`)
      throw Error("Something went wrong")
    }

    const follow = await createFollow(currentUser.id, userId)
  } catch (error) {
    console.error("[FollowAction]", error)
  }
}

export async function unFollow(userId: string) {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) throw new Error("Unauthorized")

  try {
    // this is probably not needed but w.e
    const userExists = await getUserById(userId)

    if (!userExists) {
      console.error(`[UnFollowAction] user ${userId} doesnt exist`)
      throw Error("Something went wrong")
    }

    const unfollow = await removeFollow(currentUser.id, userId)
  } catch (error) {
    console.error("[UnFollowAction]", error)
  }
}
