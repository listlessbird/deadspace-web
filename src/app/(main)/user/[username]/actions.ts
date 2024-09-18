"use server"

import { validateRequest } from "@/auth"
import {
  EditAgentProfileInput,
  editAgentProfileSchema,
  updateProfileSchema,
  UpdateUserProfileType,
} from "@/lib/validations"
import { agentCreatedByUser, updateAgentInfo } from "@/schema/agent-fns"
import { updateUserDisplayInfo } from "@/schema/db-fns"

export async function updateUserProfileAction(input: UpdateUserProfileType) {
  const validatedInputs = updateProfileSchema.parse(input)

  const { user } = await validateRequest()

  if (!user) {
    throw Error("Unauthorized")
  }

  const updatedData = await updateUserDisplayInfo({
    ...validatedInputs,
    userId: user.id,
  })

  return updatedData
}

export async function updateAgentProfileAction(
  input: EditAgentProfileInput,
  agentId: string,
) {
  const validated = editAgentProfileSchema.parse(input)

  const { user } = await validateRequest()

  if (!user) {
    throw Error("Unauthorized")
  }

  const agentBelongsToUser = await agentCreatedByUser(user.id, agentId)

  if (!agentBelongsToUser) {
    throw Error("Unauthorized")
  }

  const updatedAgent = await updateAgentInfo({
    description: validated.description,
    agentId,
    behaviouralTraits: validated.behaviouralTraits,
  })

  return updatedAgent
}
