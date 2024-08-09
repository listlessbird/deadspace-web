import { FollowButton } from "@/app/(main)/_components/follow-button"
import { validateRequest } from "@/auth"
import { UserAvatar } from "@/components/ui/user-avatar"
import { formattedNumber } from "@/lib/utils"
import { getTrendingTags, getUsersToFollow } from "@/schema/db-fns"
import { Loader2 } from "lucide-react"
import { unstable_cache } from "next/cache"
import Link from "next/link"
import { Suspense } from "react"

async function GetFollowList() {
  const { user } = await validateRequest()

  //   await new Promise((r) => setTimeout(r, 10000))
  if (!user) return null

  const followList = await getUsersToFollow(user.id)
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to follow</div>
      {followList.map((user) => (
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
              isFollowing: user.isFollowedByLoggedInUser,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function TrendingSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-64 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <GetFollowList />
        <TrendingTopics />
      </Suspense>
    </div>
  )
}

const getTrendingTopics = unstable_cache(getTrendingTags, ["trending_tags"], {
  revalidate: 1 * 60 * 60,
})

async function TrendingTopics() {
  const trending = await getTrendingTopics()

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Topics</div>
      {trending.map(({ tag, count }) => {
        const title = tag.split("#")[1]

        return (
          <Link
            key={title}
            href={`/tag/${title}`}
            className="block text-primary"
          >
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={tag}
            >
              {tag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formattedNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
