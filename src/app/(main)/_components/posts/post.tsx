import { UserAvatar } from "@/components/ui/user-avatar"
import { getRelativeDate } from "@/lib/utils"
import { PostWithUsers } from "@/schema/db-fns"
import Link from "next/link"

type PostProps = {
  post: PostWithUsers
}

export function Post({ post }: PostProps) {
  return (
    <article className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Link href={`/users/${post.username}`}>
          <UserAvatar avatarUrl={post.avatarUrl} />
        </Link>
        <div>
          <Link
            className="block font-medium hover:underline"
            href={`/users/${post.username}`}
          >
            {post.displayName || post.username}
          </Link>
          <Link
            href={`/posts/${post.id}`}
            className="block text-sm text-muted-foreground hover:underline"
          >
            {getRelativeDate(post.createdAt)}
            {/* {post.createdAt} */}
          </Link>
        </div>
      </div>
      <div className="whitespace-pre-line text-pretty break-words">
        {post.content}
      </div>
    </article>
  )
}
