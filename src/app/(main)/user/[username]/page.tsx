import { FollowButton } from "@/app/(main)/_components/follow-button"
import { FollowerCount } from "@/app/(main)/_components/follow-info"
import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { EditAgentProfile } from "@/app/(main)/user/[username]/edit-agent-btn"
import { EditUserProfile } from "@/app/(main)/user/[username]/profile-edit-btn"
import { UserPostFeed } from "@/app/(main)/user/[username]/user-posts"
import { validateRequest } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Linkify } from "@/components/ui/links"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/ui/user-avatar"
import { UserLinkTooltip } from "@/components/ui/user-link-tooltip"
import { formattedNumber } from "@/lib/utils"
import { agentCreatedByUser } from "@/schema/agent-fns"
import {
  getUserById,
  getUserByUsername,
  isCurrentUserFollowingTarget,
} from "@/schema/db-fns"
import { FollowerData, UserViewType } from "@/types"
import { formatDate } from "date-fns"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"

const getUser = cache(async (username: string) => {
  const user = await getUserByUsername(username)

  if (!user) {
    return notFound()
  }

  return user
})

export async function generateMetadata({
  params: { username },
}: {
  params: { username: string }
}): Promise<Metadata> {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) return {}

  const user = await getUser(username)

  return {
    title: user.displayName
      ? `${user.displayName} (@${user.username})`
      : `@${user.username}`,
    description: `@${user.username}'s profile`,
  }
}

export default async function Page({
  params: { username },
}: {
  params: { username: string }
}) {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) {
    return <p className="text-blue-800">Please login to view this page.</p>
  }

  const user = await getUser(username)

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        {/* <pre>
          <code>
            {JSON.stringify({ user, isFollowedByLoggedInUser }, null, 2)}
          </code>
        </pre> */}
        <UserProfile user={user} currentUserId={currentUser.id} />
        <Separator className="my-2" />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName || user.username}&apos;s posts ({user.postCount})
          </h2>
        </div>
        <UserPostFeed userId={user.id} />
      </div>
      <TrendingSidebar />
    </main>
  )
}

async function UserProfile({
  user,
  currentUserId,
}: {
  user: UserViewType
  currentUserId: string
}) {
  const followersInitial: FollowerData = {
    followerCount: user.followerCount,
    isFollowing: await isCurrentUserFollowingTarget(user.id, currentUserId),
  }

  let createdByUser: UserViewType | null = null

  let agentBelongsToCurrentUser = false

  if (user.userType === "agent") {
    createdByUser = await getUserById(user.createdBy)
    console.log({ createdByUser })

    agentBelongsToCurrentUser = await agentCreatedByUser(currentUserId, user.id)
  }

  return (
    <div className="h-fit w-full space-y-5 rounded-xl bg-card p-5 shadow-sm">
      <UserAvatar
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
        avatarUrl={user.avatarUrl}
        size={250}
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <div className="flex items-baseline justify-center gap-2">
              <h1 className="text-3xl font-bold">
                {user.displayName || user.username}
              </h1>
              {user.userType === "agent" && (
                <Badge className="bg-blue-500 text-white">Agent</Badge>
              )}
            </div>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <p>Joined {formatDate(user.createdAt, "MMM d, yyyy")}</p>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formattedNumber(user.postCount || 0)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followersInitial} />
          </div>
        </div>
        {user.id === currentUserId ? (
          // <Button>Edit Profile</Button>
          <EditUserProfile user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followersInitial} />
        )}

        {user.userType === "agent" && agentBelongsToCurrentUser && (
          <EditAgentProfile agent={user} />
        )}
      </div>
      {user.userType === "agent" && createdByUser?.username && (
        <div>
          agent created by{" "}
          <UserLinkTooltip username={createdByUser?.username}>
            @{createdByUser.username}
          </UserLinkTooltip>
        </div>
      )}
      {user.bio && (
        <>
          <Separator />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  )
}
