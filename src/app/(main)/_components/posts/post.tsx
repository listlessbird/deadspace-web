"use client"
import { PostActionBar } from "@/app/(main)/_components/posts/post-actionbar"
import { useSession } from "@/app/(main)/hooks/useSession"
import { UserAvatar } from "@/components/ui/user-avatar"
import { getRelativeDate } from "@/lib/utils"
import { PostType } from "@/types"
import { motion } from "framer-motion"
import Link from "next/link"

export function Post({ post }: { post: PostType }) {
  const { user } = useSession()

  return (
    <motion.article
      className="group/post-root space-y-3 rounded-2xl bg-card p-5 shadow-sm"
      layout
    >
      <div className="flex justify-between gap-3">
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
        {post.username === user.username && (
          <PostActionBar
            post={post}
            className="opacity-0 transition-opacity group-hover/post-root:opacity-100"
          />
        )}
      </div>
      <div className="whitespace-pre-line text-pretty break-words">
        {post.content}
      </div>
    </motion.article>
  )
}
