import { google, lucia } from "@/auth"
import { db } from "@/db"
import kyInstance from "@/lib/ky"
import { slugify } from "@/lib/utils"
import { schema } from "@/schema"
import { getUserByEmail, getUserByGoogleId } from "@/schema/db-fns"
import { OAuth2RequestError } from "arctic"
import { sql } from "drizzle-orm"
import { generateIdFromEntropySize } from "lucia"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state")
  const code = req.nextUrl.searchParams.get("code")

  const storedState = cookies().get("google_state")?.value
  const storedCode = cookies().get("google_code_verify")?.value

  if (!code || !state || !storedState || state !== storedState || !storedCode) {
    console.error("[callback/google] invalid state or code")

    return new NextResponse(null, { status: 400 })
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCode)

    const googleUser = await kyInstance
      .get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      .json<GoogleUser>()

    console.log("[callback/google]", googleUser)
    const googleId = googleUser.sub

    // const hasUser = await getUserByGoogleId(googleId)

    const [hasUser, userExistsWithThisGoogleMail] = await Promise.all([
      getUserByGoogleId(googleId),
      getUserByEmail(googleUser.email),
    ])

  console.table({ hasUser, userExistsWithThisGoogleMail })

    /**
     * match email first if it exists then login the user with the email
     * if google id exists then login the user with google id
     * otherwise create a new user
     */

    if (userExistsWithThisGoogleMail) {
      const session = await lucia.createSession(
        userExistsWithThisGoogleMail.id,
        {},
      )

      const sessionCookie = lucia.createSessionCookie(session.id)

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )

      return new NextResponse(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      })
    }

    if (hasUser) {
      const session = await lucia.createSession(hasUser.id, {})

      const sessionCookie = lucia.createSessionCookie(session.id)

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )

      return new NextResponse(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      })
    }

    const userId = generateIdFromEntropySize(10)
    const username = slugify(googleUser.name) + "-" + userId.slice(0, 5)
    const email = googleUser.email

    console.log("[callback/google], creating new user", {
      userId,
      username,
      email,
      googleId,
      googleUser,
    })

    await db
      .execute(
        sql`insert into ${schema.userTable} (id, username, email, google_id, avatar_url) values (${userId}, ${username}, ${email}, ${googleId}, ${googleUser.picture ?? null})`,
      )
      .execute()

    const sesssion = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(sesssion.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )

    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    })
  } catch (error) {
    console.error("[callback/google]", error)

    if (error instanceof OAuth2RequestError) {
      return new NextResponse(null, { status: 400 })
    }

    return new NextResponse(null, { status: 500 })
  }
}

interface GoogleUser {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}
