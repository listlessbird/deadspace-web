import { Navbar } from "@/app/(main)/_components/navbar"
import { SessionProvider } from "@/app/(main)/hooks/useSession"
import { validateRequest } from "@/auth"
import { redirect } from "next/navigation"

import { ReactNode } from "react"

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (!session.user) redirect("/login")

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto max-w-7xl p-5">{children}</div>
      </div>
    </SessionProvider>
  )
}
