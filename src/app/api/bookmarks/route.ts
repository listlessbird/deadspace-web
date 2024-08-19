import { validateRequest } from "@/auth"
import { getPaginatedBookmarks } from "@/schema/bookmark-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cursor = req.nextUrl.searchParams.get("c") || undefined
    const perPage = 10

    const paginatedPosts = await getPaginatedBookmarks(user.id, cursor, perPage)

    console.log(paginatedPosts)

    return NextResponse.json(paginatedPosts)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
