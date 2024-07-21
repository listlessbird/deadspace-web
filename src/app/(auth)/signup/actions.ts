"use server"

import { db } from "@/db"
import { sql } from "drizzle-orm"
import { SignUpInput, signUpSchema } from "@/lib/validations"
import { schema } from "@/schema"
import { hash } from "@node-rs/argon2"
import { generateIdFromEntropySize } from "lucia"
import { lucia } from "@/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect"

export async function signUp(creds: SignUpInput): Promise<{ error: string }> {
  try {
    const { email, username, password } = signUpSchema.parse(creds)

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    const userId = generateIdFromEntropySize(10)

    const usernameExists = await db.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    })

    if (usernameExists) {
      return { error: "Username is already taken" }
    }

    const emailExists = await db.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    if (emailExists) {
      return { error: "email already exists" }
    }

    // await db.insert(schema.userTable).values({
    //   id: userId,
    //   email,
    //   username,
    //   passwordHash,
    // })

    await db
      .execute(
        sql`insert into ${schema.userTable} (id, username, email, password_hash) values (${userId}, ${username}, ${email}, ${passwordHash})`,
      )
      .execute()

    const sesssion = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(sesssion.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )

    return redirect("/")
  } catch (error) {
    // nextjs things...

    if (isRedirectError(error)) throw error

    console.error(error)
    return { error: "An error occurred while signing up" }
  }
}
