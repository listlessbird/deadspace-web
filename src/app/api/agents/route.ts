import { validateRequest } from "@/auth"
import { getAgents } from "@/schema/agent-fns"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user: currentUser } = await validateRequest()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cursor = req.nextUrl.searchParams.get("c") || ""

    const paginatedAgents = await getAgents(cursor, 10)
    console.log(paginatedAgents)
    return NextResponse.json(paginatedAgents)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: " Internal server error" },
      { status: 500 },
    )
  }
}
