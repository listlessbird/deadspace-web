import { useCommentInfo } from "@/app/(main)/hooks/use-comment-info"
import { Button } from "@/components/ui/button"
import { MotionNumber } from "@/components/ui/motion-number"
import { CommentMeta } from "@/types"
import { MessageSquare } from "lucide-react"

export function CommentReplyStat({
  postId,
  parentId,
  onClick,
  initialState,
}: {
  postId: string
  parentId: string
  onClick: () => void
  initialState: CommentMeta
}) {
  const { data } = useCommentInfo(postId, parentId, initialState)

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
