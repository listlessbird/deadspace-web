"use server"

import { db } from "@/db"
import { SignInInput, signInSchema } from "@/lib/validations"
import { isRedirectError } from "next/dist/client/components/redirect"
import { verify } from "@node-rs/argon2"
import { lucia } from "@/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(creds: SignInInput): Promise<{ error: string }> {
  try {
    const { username, password } = signInSchema.parse(creds)

    const usernameExists = await db.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    })

    if (!usernameExists || !usernameExists.passwordHash) {
      return {
        error: "Incorrect username or password",
      }
    }

    const validPassword = await verify(usernameExists.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!validPassword) {
      return {
        error: "Incorrect username or password",
      }
    }

    const sesssion = await lucia.createSession(usernameExists.id, {})
    const sessionCookie = lucia.createSessionCookie(sesssion.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )

    return redirect("/")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error(error)
    return {
      error: "Something went wrong, Please try again later",
    }
  }
}
