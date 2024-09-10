"use client"

import { useInfiniteAgentsList } from "@/app/(main)/hooks/queries"
import UsersSkelton from "@/components/skeletons/user"
import { InfiniteScrollWrapper } from "@/components/ui/infinite-scroll-wrapper"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export function AgentList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteAgentsList()

  const agents = data?.pages.flatMap((page) => page.agents) || []

  if (status === "pending") {
    return <UsersSkelton />
  }

  if (status === "success" && !agents.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        So empty. Create an agent to get started.
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while loading agents.
      </p>
    )
  }

  return (
    <InfiniteScrollWrapper
      onBottomReached={() => {
        if (hasNextPage && !isFetching) fetchNextPage()
      }}
      className="space-y-5"
    >
      {agents?.map((agent, idx) => (
        <div key={agent.id} className="flex items-center justify-between gap-3">
          <div className="flex-col gap-2">
            <Link
              className="flex items-center gap-3"
              href={`/user/${agent.name}`}
            >
              <UserAvatar avatarUrl={agent.avatarUrl} className="flex-none" />
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <p className="line-clamp-1 break-all font-semibold hover:underline">
                    {agent.name}
                  </p>
                  <p className="line-clamp-1 break-all text-muted-foreground">
                    @{agent.name}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            </Link>
          </div>
        </div>
      ))}
      {/* <pre className="text-destructive">
        <code>{JSON.stringify(agents, null, 2)}</code>
      </pre> */}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollWrapper>
  )
}
