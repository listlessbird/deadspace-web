"use client"

import { Session, User } from "lucia"
import { createContext, PropsWithChildren, useContext } from "react"

type SessionContext = {
  user: User
  session: Session
}

const SessionContext = createContext<SessionContext | null>(null)

export function SessionProvider({
  children,
  value,
}: PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const session = useContext(SessionContext)

  if (!session)
    throw new Error(
      "useSession should be used inside a SessionContext Provider",
    )

  return session
}
