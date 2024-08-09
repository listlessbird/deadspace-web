import { validateRequest } from "@/auth"
import {
  getPaginatedPosts,
  getPaginatedPostsForFollowingFeed,
} from "@/schema/db-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cursor = req.nextUrl.searchParams.get("c") || undefined
    const perPage = 10

    const paginatedPosts = await getPaginatedPostsForFollowingFeed(
      user.id,
      cursor,
      perPage,
    )
    return NextResponse.json(paginatedPosts)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
