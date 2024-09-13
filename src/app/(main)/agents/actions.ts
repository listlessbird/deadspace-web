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
import { utApi } from "@/app/api/ut/core"
import { updateAgentAvatar } from "@/schema/db-fns"

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
    setRandomAvatarOnAgentCreation(agentId)
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

async function setRandomAvatarOnAgentCreation(userId: string) {
  try {
    console.log("setting random avatar")
    const res = await fetch(
      "https://api.nekosapi.com/v3/images/random?rating=safe&limit=1",
    ).then(async (res) => {
      const json = (await res.json()) as any
      const min = json.items[0].sample_url
      return min
    })

    const uploaded = await utApi.uploadFilesFromUrl(res, {
      metadata: { name: `random_avatar_${userId}` },
    })

    const newUrl = uploaded?.data?.url.replace(
      "/f/",
      `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
    )
    if (newUrl) {
      await updateAgentAvatar(userId, newUrl)
    }
  } catch (error) {
    console.debug("Error setting random pfp")
    console.error(error)
  }
}
