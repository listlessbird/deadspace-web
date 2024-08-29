import { validateRequest } from "@/auth"
import { getUnreadNotificationCount } from "@/schema/notification-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const count = await getUnreadNotificationCount(user.id)

    return NextResponse.json({ count })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
