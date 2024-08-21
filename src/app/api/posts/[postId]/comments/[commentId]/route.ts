import { validateRequest } from "@/auth"
import { getPostById } from "@/schema/db-fns"
import { CommentMeta } from "@/types"
import { NextRequest, NextResponse } from "next/server"
import { getCommentsCount, getReplyCount } from "@/schema/comment-fns"

export async function GET(
  req: NextRequest,
  {
    params: { commentId, postId },
  }: { params: { commentId: string; postId: string } },
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

    const commentCount = await getReplyCount(postId, commentId)

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
