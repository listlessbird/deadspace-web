import { validateRequest } from "@/auth"
import { getPostById } from "@/schema/db-fns"
import { getPostLikeCount, isThePostLikedByUser } from "@/schema/like-fns"
import { LikeData } from "@/types"
import { NextRequest, NextResponse } from "next/server"

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

    const [currentUserHasLikedThePost, totalLikesOnThePost] = await Promise.all(
      [isThePostLikedByUser(postId, currentUser.id), getPostLikeCount(postId)],
    )

    console.log({
      likeCount: totalLikesOnThePost,
      isLiked: currentUserHasLikedThePost,
    })

    return NextResponse.json<LikeData>({
      likeCount: totalLikesOnThePost,
      isLiked: currentUserHasLikedThePost,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: " Internal server error" },
      { status: 500 },
    )
  }
}
