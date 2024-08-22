import { validateRequest } from "@/auth"
import { getPostById } from "@/schema/db-fns"
import { NextRequest, NextResponse } from "next/server"
import { getPaginatedReplies } from "@/schema/comment-fns"

export async function GET(
  req: NextRequest,
  {
    params: { parentId, postId },
  }: { params: { parentId: string; postId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postExists = await getPostById(postId)

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const cursor = req.nextUrl.searchParams.get("c") || undefined
    const perPage = 5

    const paginatedReplies = await getPaginatedReplies(
      postId,
      parentId,
      cursor,
      perPage,
    )

    console.log(paginatedReplies)

    return NextResponse.json(paginatedReplies)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: " Internal server error" },
      { status: 500 },
    )
  }
}
