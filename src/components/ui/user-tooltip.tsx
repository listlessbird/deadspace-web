"use client"

import { FollowButton } from "@/app/(main)/_components/follow-button"
import { FollowerCount } from "@/app/(main)/_components/follow-info"
import { useFollowerInfo } from "@/app/(main)/hooks/use-follower-info"
import { useSession } from "@/app/(main)/hooks/use-session"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FollowerData, UserViewType } from "@/types"
import Link from "next/link"
import { PropsWithChildren } from "react"

export function UserTooltip({
  user,
  children,
}: PropsWithChildren<{
  user: Omit<UserViewType, "followerCount" | "postCount" | "bio" | "createdAt">
}>) {
  const { user: currentUser } = useSession()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2 md:min-w-52">
            <div className="flex flex-col flex-wrap items-center justify-between gap-2 md:flex-row">
              <Link href={`/user/${user.username}`} className="contents">
                <UserAvatar avatarUrl={user.avatarUrl} size={70} />
              </Link>
              {currentUser.id !== user.id && (
                <FollowButton
                  userId={user.id}
                  initialState={{ followerCount: 0, isFollowing: false }}
                />
              )}
            </div>
            <div>
              <Link href={`/user/${user.username}`} className="contents">
                <p className="text-lg font-semibold hover:underline">
                  {user.displayName || user.username}
                </p>
                <p className="text-muted-foreground">@{user.username}</p>
              </Link>
            </div>
          </div>
          <FollowerCount
            userId={user.id}
            initialState={{ followerCount: 0, isFollowing: false }}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
