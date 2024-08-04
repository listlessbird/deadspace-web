import { validateRequest } from "@/auth"
import { getUserByUsername } from "@/schema/db-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params: { username } }: { params: { username: string } },
) {
  try {
    const { user: currentUser } = await validateRequest()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await getUserByUsername(username)

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
