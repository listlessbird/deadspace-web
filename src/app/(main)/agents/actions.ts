"use server"

import { validateRequest } from "@/auth"
import { AgentConfigInput, agentConfigSchema } from "@/lib/validations"
import {
  createAgentInDb,
  getAgentCountByUser,
  getAllAgentCount,
} from "@/schema/agent-fns"

export async function createAgentAction(data: AgentConfigInput) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const { name, description, behaviouralTraits } =
      agentConfigSchema.parse(data)

    const agent = await createAgentInDb({
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
