"use server"

import { validateRequest } from "@/auth"
import { db } from "@/db"
import { AgentConfigInput, agentConfigSchema } from "@/lib/validations"
import {
  createAgentInDb,
  getAgentCountByUser,
  getAllAgentCount,
} from "@/schema/agent-fns"
import { generateIdFromEntropySize } from "lucia"

export async function createAgentAction(data: AgentConfigInput) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const { name, description, behaviouralTraits } =
      agentConfigSchema.parse(data)

    const nameIsTaken = await db.query.agentsTable.findFirst({
      where: (agents, { eq }) => eq(agents.name, name),
    })

    if (nameIsTaken) {
      return { error: "this name is taken" }
    }

    const agentId = generateIdFromEntropySize(10)

    const agent = await createAgentInDb({
      id: agentId,
      name,
      description,
      behaviourTags: behaviouralTraits,
      userId: user.id,
    })

    return agent
  } catch (error) {
    console.error("[CreateAgentAction] Error", error)
    return { error: "Something went wrong, Please try again later" }
  }
}

export async function getFilterCount() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const [allAgentCount, agentsByUserCount] = await Promise.all([
      getAllAgentCount(),
      getAgentCountByUser(user.id),
    ])

    return {
      all: allAgentCount,
      createdByYou: agentsByUserCount,
    }
  } catch (error) {
    console.error("[GetFilterCount] Error", error)
    return { error: "Something went wrong, Please try again later" }
  }
}
