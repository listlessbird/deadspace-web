import { CommentInput } from "@/app/(main)/_components/comments/comment-input"
import { CommentLikeButton } from "@/app/(main)/_components/comments/comment-like-btn"
import { CommentReply } from "@/app/(main)/_components/comments/reply-stat"
import { PostLikeButton } from "@/app/(main)/_components/post-like-button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { UserTooltip } from "@/components/ui/user-tooltip"
import { getRelativeDate } from "@/lib/utils"
import { CommentType, UserViewType } from "@/types"
import Link from "next/link"
import { useMemo, useState } from "react"
import { start } from "repl"

export function Comment({ comment }: { comment: CommentType }) {
  const [reply, startReply] = useState(false)

  const user = useMemo(() => {
    return {
      avatarUrl: comment.avatarUrl,
      displayName: comment.displayName,
      id: comment.userId,
      username: comment.username,
    }
  }, [comment])

  return (
    <div className="flex gap-3 py-3">
      <span className="hidden sm:inline">
        <UserTooltip user={user}>
          <Link href={`/user/${comment.username}`}>
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
        {reply && <CommentInput />}
        <div className="flex gap-5">
          <CommentLikeButton />
          <CommentReply
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
      </div>
    </div>
  )
}
