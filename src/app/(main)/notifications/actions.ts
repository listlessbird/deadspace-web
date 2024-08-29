"use server"

import { validateRequest } from "@/auth"
import { markNotificationsAsRead } from "@/schema/notification-fns"

export async function markNotificationsAsReadAction() {
  const { user } = await validateRequest()

  if (!user) {
    throw Error("Unauthorized")
  }

  const markAllAsRead = await markNotificationsAsRead(user.id)

  return markAllAsRead
}
