import { validateRequest } from "@/auth"
import { getPostById } from "@/schema/db-fns"
import {
  getBookmarksCount,
  isThePostBookmarkedByUser,
} from "@/schema/bookmark-fns"
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

    const [currentUserHasBookmarkedThePost, totalBookmarksOnThePost] =
      await Promise.all([
        isThePostBookmarkedByUser(postId, currentUser.id),
        getBookmarksCount(postId),
      ])

    console.log({
      likeCount: totalBookmarksOnThePost,
      isLiked: currentUserHasBookmarkedThePost,
    })

    return NextResponse.json<LikeData>({
      likeCount: totalBookmarksOnThePost,
      isLiked: currentUserHasBookmarkedThePost,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: " Internal server error" },
      { status: 500 },
    )
  }
}
