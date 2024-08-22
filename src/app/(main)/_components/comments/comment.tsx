import { CommentLikeButton } from "@/app/(main)/_components/comments/comment-like-btn"
import { ReplyInput } from "@/app/(main)/_components/comments/reply-input"
import { CommentReplyStat } from "@/app/(main)/_components/comments/reply-stat"
import { PostLikeButton } from "@/app/(main)/_components/post-like-button"
import { useInfiniteReplies } from "@/app/(main)/hooks/queries"
import { UserAvatar } from "@/components/ui/user-avatar"
import { UserTooltip } from "@/components/ui/user-tooltip"
import { cn, getRelativeDate } from "@/lib/utils"
import { CommentType, UserViewType } from "@/types"
import Link from "next/link"
import { HTMLAttributes, useMemo, useState } from "react"

export function Comment({
  comment,
  className,
}: { comment: CommentType } & HTMLAttributes<HTMLDivElement>) {
  const [reply, startReply] = useState(false)

  const user = useMemo(() => {
    return {
      avatarUrl: comment.avatarUrl,
      displayName: comment.displayName,
      id: comment.userId,
      username: comment.username,
    }
  }, [comment])

  const { data, isLoading, hasNextPage, isFetchingNextPage } =
    useInfiniteReplies(comment.postId, comment.id)

  const replies = useMemo(() => {
    const replies = data?.pages.map((page) => page.data).flat()

    return replies?.map((reply) => {
      return <Comment key={reply.id} comment={reply} className="reply py-0" />
    })
  }, [data])

  return (
    <>
      <div className={cn("flex gap-3 py-3", className)}>
        <span className="comment-avatar-wrap hidden sm:inline-block">
          <UserTooltip user={user}>
            <Link
              href={`/user/${comment.username}`}
              className="comment-avatar inline-block overflow-hidden"
            >
              <UserAvatar avatarUrl={comment.avatarUrl} size={40} />
            </Link>
          </UserTooltip>
        </span>
        <div className="w-full">
          <div className="flex items-center gap-4 text-sm">
            <UserTooltip user={user}>
              <Link href={`/user/${comment.username}`}>
                <span className="text-sm font-medium hover:underline">
                  {comment.displayName || comment.username}
                </span>
              </Link>
            </UserTooltip>
            <span className="text-muted-foreground">
              {getRelativeDate(comment.createdAt!)}
            </span>
          </div>
          <div>
            <p className="text-sm">{comment.content}</p>
          </div>
          {reply && <ReplyInput comment={comment} postId={comment.postId} />}
          <div className="flex gap-5">
            <CommentLikeButton />
            <CommentReplyStat
              postId={comment.postId}
              parentId={comment.id}
              onClick={() => {
                startReply((p) => !p)
              }}
              initialState={{
                commentCount: comment.replyCount,
              }}
            />
          </div>
          {reply && <div className="ps-2">{replies}</div>}
        </div>
      </div>
    </>
  )
}
