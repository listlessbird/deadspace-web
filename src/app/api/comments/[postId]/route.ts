import { validateRequest } from "@/auth"
import { getPaginatedComments } from "@/schema/comment-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cursor = req.nextUrl.searchParams.get("c") || undefined
    const perPage = 5

    const paginatedComments = await getPaginatedComments(
      user.id,
      postId,
      cursor,
      perPage,
    )

    return NextResponse.json(paginatedComments)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
