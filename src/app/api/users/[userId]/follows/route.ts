import { validateRequest } from "@/auth"
import { db } from "@/db"
import { schema } from "@/schema"
import { getFollowerCount, getUserById } from "@/schema/db-fns"
import { FollowerData } from "@/types"
import { sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest()

    if (!currentUser) {
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userExists = await getUserById(userId)

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // const currentUserIsFollowing = await db
    //   .select()
    //   .from(schema.followerRelation)
    //   .where(sql`${schema.followerRelation.followerId} = ${currentUser?.id}`)
    //   .then((v) => !!v)

    // const followerCount = await getFollowerCount(userId)

    const [currentUserIsFollowing, followerCount] = await Promise.all([
      db
        .select()
        .from(schema.followerRelation)
        .where(sql`${schema.followerRelation.followFrom} = ${currentUser?.id}`)
        .then((v) => !!v),
      getFollowerCount(userId),
    ])

    return NextResponse.json<FollowerData>({
      followerCount: followerCount.count,
      isFollowing: currentUserIsFollowing,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: " Internal server error" },
      { status: 500 },
    )
  }
}
