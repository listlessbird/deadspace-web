import { validateRequest } from "@/auth"
import { db } from "@/db"
import { schema } from "@/schema"
import { getPostsWithUsers } from "@/schema/db-fns"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await getPostsWithUsers()

    return NextResponse.json(posts)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
