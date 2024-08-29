import { validateRequest } from "@/auth"
import {
  getNotifications,
  getPaginatedNotifications,
} from "@/schema/notification-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParam = req.nextUrl.searchParams.get("c") || undefined

    const paginatedNotifications = await getPaginatedNotifications({
      userId: user.id,
      cursor: searchParam,
      limit: 10,
    })

    return NextResponse.json(paginatedNotifications)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
