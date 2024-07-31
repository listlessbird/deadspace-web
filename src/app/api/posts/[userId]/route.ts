import { validateRequest } from "@/auth"
import { getPaginatedUserPosts, getUserById } from "@/schema/db-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest()

    if (!currentUser) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const cursor = req.nextUrl.searchParams.get("c") || undefined
    const perPage = 10

    const userExists = await getUserById(userId)

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const posts = await getPaginatedUserPosts(userId, cursor, perPage)

    return NextResponse.json(posts)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
