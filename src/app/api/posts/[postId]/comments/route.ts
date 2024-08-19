import { validateRequest } from "@/auth"
import { getPostById } from "@/schema/db-fns"
import { CommentMeta } from "@/types"
import { NextRequest, NextResponse } from "next/server"
import { getCommentsCount } from "@/schema/comment-fns"

export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest()

    if (!currentUser) {
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      //   ts things :D
      return
    }

    const postExists = await getPostById(postId)

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const commentCount = await getCommentsCount(postId)

    console.log({
      commentCount,
    })

    return NextResponse.json<CommentMeta>({
      commentCount,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: " Internal server error" },
      { status: 500 },
    )
  }
}
