"use client"

import { FollowButton } from "@/app/(main)/_components/follow-button"
import PostsSkelton from "@/components/skeletons/posts"
import { UserAvatar } from "@/components/ui/user-avatar"
import kyInstance from "@/lib/ky"
import { UserViewType } from "@/types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

export function UserResults({ query }: { query: string }) {
  const { data: users, status } = useQuery({
    queryKey: ["users", "search-results", query],
    queryFn: () =>
      kyInstance
        .get("/api/search/users", { searchParams: { q: query } })
        .json<UserViewType[]>(),
    enabled: !!query,
  })

  if (status === "pending") {
    return <PostsSkelton />
  }

  if (status === "success" && !users.length) {
    return (
      <p className="text-center text-muted-foreground">
        No users matching the query.
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while getting the search results.
      </p>
    )
  }

  return (
    <div>
      {users?.map((user, idx) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <Link
            className="flex items-center gap-3"
            href={`/user/${user.username}`}
          >
            <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {user.displayName || user.username}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{user.username}
            </p>
          </Link>
          <FollowButton
            userId={user.id}
            initialState={{
              followerCount: user.followerCount,
              isFollowing: false,
            }}
          />
        </div>
      ))}
    </div>
  )
}
