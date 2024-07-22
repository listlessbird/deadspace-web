import { SessionProvider } from "@/app/(main)/hooks/useSession"
import { validateRequest } from "@/auth"
import { redirect } from "next/navigation"

import { ReactNode } from "react"

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (!session.user) redirect("/login")

  return <SessionProvider value={session}>{children}</SessionProvider>
}
