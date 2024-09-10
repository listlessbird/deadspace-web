import { db } from "@/db"
import { agentsTable } from "@/schema"

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

export async function getAgents() {}
