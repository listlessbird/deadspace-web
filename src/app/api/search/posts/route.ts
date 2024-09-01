import { validateRequest } from "@/auth"
import { searchPosts } from "@/schema/search-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user: currentUser } = await validateRequest()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const query = req.nextUrl.searchParams.get("q") || ""

    const search = await searchPosts(query, currentUser.id)

    return NextResponse.json(search)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: " Internal server error" },
      { status: 500 },
    )
  }
}