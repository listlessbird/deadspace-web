import { Navbar } from "@/app/(main)/_components/navbar"
import { QueryProvider } from "@/app/(main)/hooks/query-provider"
import { SessionProvider } from "@/app/(main)/hooks/useSession"
import { Menubar } from "@/app/(main)/menubar"
import { validateRequest } from "@/auth"
import { redirect } from "next/navigation"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { ReactNode } from "react"
import { extractRouterConfig } from "uploadthing/server"
import { fileRouter } from "@/app/api/ut/core"

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (!session.user) redirect("/login")

  return (
    <QueryProvider>
      <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
      <SessionProvider value={session}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
            <Menubar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
            {children}
          </div>
          <Menubar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
        </div>
      </SessionProvider>
    </QueryProvider>
  )
}
