import {
  dislikePostAction,
  likePostAction,
} from "@/app/(main)/feed-actions/post-like-action"
import { usePostCommentInfo } from "@/app/(main)/hooks/use-comment-info"
import { usePostLikeInfo } from "@/app/(main)/hooks/use-post-like-info"
import { Button } from "@/components/ui/button"
import { MotionNumber } from "@/components/ui/motion-number"
import { cn } from "@/lib/utils"
import { CommentMeta } from "@/types"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import { MessageSquare } from "lucide-react"
import { useMemo } from "react"

//  animate={{
//           fill: data.isLiked ? "#dc2626" : "",
//           color: data.isLiked ? "#dc2626" : "",
//         }}
//         whileHover={{ scale: 1.1, rotate: "5deg" }}
//         whileTap={{ scale: 1.1, rotate: "5deg" }}
export function PostCommentButton({
  postId,
  onClick,
  initialState,
}: {
  postId: string
  onClick: () => void
  initialState: CommentMeta
}) {
  const { data } = usePostCommentInfo(postId, initialState)

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      onClick={onClick}
      className="flex size-fit items-center justify-center gap-2 border-none p-2 outline-none"
    >
      <MessageSquare className="size-5 border-none outline-none" />
      <MotionNumber value={data.commentCount} className="text-sm" />
    </Button>
  )
}
