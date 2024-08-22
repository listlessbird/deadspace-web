"use client"
import { PostBookmarkButton } from "@/app/(main)/_components/bookmark-button"
import { PostCommentButton } from "@/app/(main)/_components/comments/comment-button"
import { Comments } from "@/app/(main)/_components/comments/comments"
import { PostLikeButton } from "@/app/(main)/_components/post-like-button"
import { PostActionBar } from "@/app/(main)/_components/posts/post-actionbar"
import { PostAttachments } from "@/app/(main)/_components/posts/post-media"
import { useSession } from "@/app/(main)/hooks/useSession"
import { Linkify } from "@/components/ui/links"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/ui/user-avatar"
import { UserTooltip } from "@/components/ui/user-tooltip"
import { getRelativeDate } from "@/lib/utils"
import { PostType } from "@/types"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export function Post({ post }: { post: PostType }) {
  const { user } = useSession()

  const navigate = useRouter()

  const pathname = usePathname()

  const [showComments, setShowComments] = useState(false)

  const userInfo = useMemo(
    () => ({
      username: post.username,
      displayName: post.displayName,
      avatarUrl: post.avatarUrl,
      id: post.userId,
    }),
    [post],
  )

  useEffect(() => {
    if (pathname === `/posts/${post.id}`) {
      setShowComments(true)
    }
  }, [pathname, post.id])

  return (
    <motion.article
      className="group/post-root space-y-3 rounded-2xl bg-card p-5 shadow-sm"
      layout
    >
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={userInfo}>
            <Link href={`/user/${post.username}`}>
              <UserAvatar avatarUrl={post.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={userInfo}>
              <Link
                className="block font-medium hover:underline"
                href={`/user/${post.username}`}
              >
                {post.displayName || post.username}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {getRelativeDate(post.createdAt)}
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
      <Linkify>
        <div className="whitespace-pre-line text-pretty break-words">
          {post.content}
        </div>
      </Linkify>
      {!!post.attachments?.length && post.attachments.length > 0 && (
        <PostAttachments attachments={post.attachments} />
      )}
      <Separator className="text-muted-foreground" />
      <div className="flex items-center justify-between">
        <PostLikeButton
          postId={post.id}
          initialState={{
            likeCount: post.likes.likeCount,
            isLiked: post.likes.isLiked,
          }}
        />
        <PostCommentButton
          postId={post.id}
          initialState={{ commentCount: post.comments.commentCount }}
          onClick={() => {
            navigate.push(`/posts/${post.id}`)
          }}
        />
        <PostBookmarkButton
          postId={post.id}
          initialState={{
            bookMarkCount: post.bookmarks.bookMarkCount,
            isBookMarked: post.bookmarks.isBookMarked,
          }}
        />
      </div>
      {showComments && <Comments post={post} />}
    </motion.article>
  )
}
