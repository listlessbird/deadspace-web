import { FollowButton } from "@/app/(main)/_components/follow-button"
import { Post } from "@/app/(main)/_components/posts/post"
import { validateRequest } from "@/auth"
import { Linkify } from "@/components/ui/links"
import { UserAvatar } from "@/components/ui/user-avatar"
import { UserTooltip } from "@/components/ui/user-tooltip"
import {
  getPostById,
  getUserById,
  isCurrentUserFollowingTarget,
} from "@/schema/db-fns"
import { UserViewType } from "@/types"
import { Loader2 } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache, Suspense } from "react"

const getPost = cache(async (postId: string) => {
  const post = await getPostById(postId)

  if (!post) return notFound()

  return post
})

export async function generateMetadata({
  params: { postId },
}: {
  params: { postId: string }
}): Promise<Metadata> {
  const post = await getPost(postId)

  if (!post) return {}

  return {
    title: post.displayName
      ? `${post.displayName} on deadspace: ${post.content}`
      : `${post.username} on deadspace: ${post.content}`,
    description: `@${post.username}'s Post`,
    openGraph: {
      type: "website",
      images:
        post.attachments.length > 0 ? post.attachments[0].attachmentUrl : "",
    },
  }
}

export default async function Page({
  params: { postId },
}: {
  params: { postId: string }
}) {
  const post = await getPost(postId)

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
      <div className="sticky top-[5rem] hidden h-fit w-80 flex-none lg:block">
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <PostUserInfo userId={post.userId} />
        </Suspense>
      </div>
    </main>
  )
}

async function PostUserInfo({ userId }: { userId: string }) {
  const user = await getUserById(userId)

  const { user: currentUser } = await validateRequest()

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="space-y-5 text-xl font-bold">
        <p>About the post author</p>
        <UserTooltip user={user}>
          <Link
            href={`/user/${user.username}`}
            className="flex w-full items-center gap-3"
          >
            <UserAvatar avatarUrl={user.avatarUrl} />
            <div className="ms-2">
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName || user.username}
              </p>
              <p className="line-clamp-1 break-all text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>
            <div className="ms-auto">
              {currentUser && user.id !== currentUser.id && (
                <FollowButton
                  userId={user.id}
                  initialState={{
                    followerCount: user.followerCount,
                    isFollowing: await isCurrentUserFollowingTarget(
                      user.id,
                      currentUser.id,
                    ),
                  }}
                />
              )}
            </div>
          </Link>
        </UserTooltip>
        <Linkify>
          <div className="line-clamp-5 whitespace-pre-line text-pretty text-muted-foreground">
            {user.bio}
          </div>
        </Linkify>
      </div>
    </div>
  )
}
