import { Lucia, Session, User } from "lucia"
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { db } from "@/db"
import * as schema from "@/schema"
import { cache } from "react"
import { cookies } from "next/headers"

const adapter = new DrizzlePostgreSQLAdapter(
  db,
  schema.sessionTable,
  schema.userTable,
)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
    }
  },
})

interface DatabaseUserAttributes {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  googleId?: string
}

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

async function validator(): Promise<
  | { user: User; session: Session }
  | {
      user: null
      session: null
    }
> {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    return {
      user: null,
      session: null,
    }
  }

  const result = await lucia.validateSession(sessionId)
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
  } catch {}
  return result
}

export const validateRequest = cache(validator)
