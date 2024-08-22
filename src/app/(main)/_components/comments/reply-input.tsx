import { useOnCommentSubmit } from "@/app/(main)/_components/comments/comment-mutation"
import { useOnReplySubmit } from "@/app/(main)/_components/comments/reply-mutation"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { CommentType, PostType } from "@/types"
import { SendHorizonal } from "lucide-react"
import { FormEvent, useCallback, useState } from "react"

export function ReplyInput({
  comment,
  postId,
}: {
  comment: CommentType
  postId: string
}) {
  const [content, setContent] = useState("")

  const mutation = useOnReplySubmit(postId)

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      if (!content) return

      mutation.mutate(
        { postId, commentId: comment.id, content },
        {
          onSuccess: () => {
            setContent("")
          },
        },
      )
    },
    [content, comment.id, postId, mutation],
  )

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Reply"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <LoadingButton
        loading={mutation.isPending}
        type="submit"
        variant={"ghost"}
        size={"icon"}
        disabled={!content.trim() || mutation.isPending}
      >
        <span className="sr-only">Submit Reply</span>
        <SendHorizonal />
      </LoadingButton>
    </form>
  )
}
