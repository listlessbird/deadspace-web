import { validateRequest } from "@/auth"
import { db } from "@/db"
import { schema } from "@/schema"
import { getPaginatedPosts, getPostsWithUsers } from "@/schema/db-fns"
import { desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cursor = req.nextUrl.searchParams.get("c") || undefined
    const perPage = 10

    const paginatedPosts = await getPaginatedPosts(cursor, perPage)

    return NextResponse.json(paginatedPosts)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
