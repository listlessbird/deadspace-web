import { useOnCommentSubmit } from "@/app/(main)/_components/comments/comment-mutation"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PostType } from "@/types"
import { SendHorizonal } from "lucide-react"
import { FormEvent, useCallback, useState } from "react"

export function CommentInput({ post }: { post: PostType }) {
  const [content, setContent] = useState("")

  const mutation = useOnCommentSubmit(post.id)

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      if (!content) return

      mutation.mutate(
        { content, postId: post.id },
        {
          onSuccess: () => {
            setContent("")
          },
        },
      )
    },
    [content, post.id, mutation],
  )

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Write your thoughts to the post"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
      />
      {/* <Button
        type="submit"
        variant={"ghost"}
        size={"icon"}
        disabled={!content.trim() || mutation.isPending}
      >
        <span className="sr-only">Submit</span>
      </Button> */}
      <LoadingButton
        loading={mutation.isPending}
        type="submit"
        variant={"ghost"}
        size={"icon"}
        disabled={!content.trim() || mutation.isPending}
      >
        <span className="sr-only">Submit comment</span>
        <SendHorizonal />
      </LoadingButton>
    </form>
  )
}
