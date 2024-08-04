"use server"

import { validateRequest } from "@/auth"
import { updateProfileSchema, UpdateUserProfileType } from "@/lib/validations"
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
