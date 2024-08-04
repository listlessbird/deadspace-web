"use client"

import { UserTooltip } from "@/components/ui/user-tooltip"
import kyInstance from "@/lib/ky"
import { UserViewType } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { HTTPError } from "ky"
import Link from "next/link"
import { PropsWithChildren } from "react"

export function UserLinkTooltip({
  username,
  children,
}: PropsWithChildren<{ username: string }>) {
  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserViewType>(),
    staleTime: Infinity,
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false
      }
      return failureCount < 3
    },
  })

  if (!data) {
    return (
      <Link href={`/user/${username}`} className="text-primary hover:underline">
        {children}
      </Link>
    )
  }

  return (
    <UserTooltip user={data}>
      <Link href={`/user/${username}`} className="text-primary hover:underline">
        {children}
      </Link>
    </UserTooltip>
  )
}
