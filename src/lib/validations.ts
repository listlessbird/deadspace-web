import { z } from "zod"

const requiredString = z.string().trim().min(1, "Required")

export const signUpSchema = z.object({
  email: requiredString.email("Invalid email"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_]+$/,
    "Only letters, numbers, _ and _ allowed",
  ),
  password: requiredString.min(8, "Minimum 8 characters"),
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  username: requiredString,
  password: requiredString,
})

export type SignInInput = z.infer<typeof signInSchema>

export const createPostSchema = z.object({
  content: requiredString,
  attachmentIds: z
    .array(z.string())
    .max(5, "Cannot have more than 5 attachments"),
})

export const updateProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must not exceeed 1000 characters"),
})

export type UpdateUserProfileType = z.infer<typeof updateProfileSchema>
