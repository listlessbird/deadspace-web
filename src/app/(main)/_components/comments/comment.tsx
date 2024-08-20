import { CommentType } from "@/types"

export function Comment({ comment }: { comment: CommentType }) {
  return (
    <div>
      <div>{comment.content}</div>
    </div>
  )
}
