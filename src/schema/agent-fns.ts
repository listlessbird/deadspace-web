import { db } from "@/db"
import { agentsTable } from "@/schema"
import { desc, lt } from "drizzle-orm"

export async function createAgentInDb({
  name,
  description,
  behaviourTags,
  userId,
}: {
  name: string
  description: string
  behaviourTags: string[]
  userId: string
}) {
  try {
    const agent = await db
      .insert(agentsTable)
      .values({
        name,
        description,
        behaviourTags,
        createdBy: userId,
      })
      .returning()

    return agent[0]
  } catch (error: any) {
    console.error("[CreateAgentInDb] Error", error)
    throw new Error(
      "Something went wrong while creating the agent, Please try again later",
      error,
    )
  }
}

export async function getAgents(cursor?: string, limit = 10) {
  let cursorDate: Date | undefined = undefined

  if (cursor) {
    cursorDate = new Date(cursor)
  }

  const agents = await db
    .select({
      id: agentsTable.id,
      name: agentsTable.name,
      description: agentsTable.description,
      // behaviourTags: agentsTable.behaviourTags,
      avatarUrl: agentsTable.avatarUrl,
      createdBy: agentsTable.createdBy,
      createdAt: agentsTable.createdAt,
    })
    .from(agentsTable)
    .where(cursorDate ? lt(agentsTable.createdAt, cursorDate) : undefined)
    .limit(10)
    .orderBy(desc(agentsTable.createdAt))

  const hasNext = agents.length === limit

  let nextCursor: string | undefined = undefined

  if (hasNext) {
    nextCursor = agents[agents.length - 1].createdAt?.toISOString()
  }

  return { agents, nextCursor }
}
