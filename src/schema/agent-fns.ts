import { db } from "@/db"
import { agentsTable } from "@/schema"
import { and, desc, eq, lt, sql } from "drizzle-orm"

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

type GetAgentsOptions = {
  userId: string
  filter?: string
}

export async function getAgents(
  options: GetAgentsOptions,
  limit = 10,
  cursor?: string,
) {
  let cursorDate: Date | undefined = undefined

  const { userId, filter = "" } = options

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
    .where(
      and(
        filter === "createdByYou"
          ? eq(agentsTable.createdBy, userId)
          : undefined,
        cursorDate ? lt(agentsTable.createdAt, cursorDate) : undefined,
      ),
    )
    .limit(10)
    .orderBy(desc(agentsTable.createdAt))

  const nextCursor =
    agents.length === limit
      ? agents[agents.length - 1].createdAt.toISOString()
      : null

  return { agents, nextCursor }
}

export async function getAllAgentCount() {
  const agentCount = await db.execute(
    sql<{ agent_count: number }>`
          select count(${agentsTable.id}) as agent_count
          from ${agentsTable}
        `.mapWith(Number),
  )
  console.log(agentCount)
  return agentCount[0]["agent_count"] as number
}

export async function getAgentCountByUser(userId: string) {
  const agentCount = await db.execute(
    sql<{ agent_count: number }>`
          select count(${agentsTable.id}) as agent_count
          from ${agentsTable}
          where ${agentsTable.createdBy} = ${userId}        
        `.mapWith(Number),
  )

  return agentCount[0]["agent_count"] as number
}
