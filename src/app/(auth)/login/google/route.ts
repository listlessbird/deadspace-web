import { google } from "@/auth"
import { generateCodeVerifier, generateState } from "arctic"
import { cookies } from "next/headers"

export async function GET() {
  const state = generateState()
  const verifyCode = generateCodeVerifier()

  const url = await google.createAuthorizationURL(state, verifyCode, {
    scopes: ["email", "profile"],
  })

  cookies().set("google_state", state, {
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  })

  cookies().set("google_code_verify", verifyCode, {
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  })

  return Response.redirect(url)
}
