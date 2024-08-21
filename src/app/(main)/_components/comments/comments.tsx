import { Comment } from "@/app/(main)/_components/comments/comment"
import { CommentInput } from "@/app/(main)/_components/comments/comment-input"
import { useInfiniteComments } from "@/app/(main)/hooks/queries"
import { LoadingButton } from "@/components/ui/loading-button"
import { PostType } from "@/types"
import { useMemo } from "react"

export function Comments({ post }: { post: PostType }) {
  const { data, isFetchingNextPage, isLoading, hasNextPage, fetchNextPage } =
    useInfiniteComments(post.id)

  const contents = useMemo(() => {
    const comments = data?.pages.flatMap((page) => page.data) ?? []
    if (isLoading) return <div>Loading...</div>

    if (!comments.length) return <div>No comments yet</div>

    return comments.map((comment) => {
      if (!comment.parentId) {
        return <Comment key={comment.id} comment={comment} />
      }
    })
  }, [data, isLoading])

  return (
    <div>
      <CommentInput post={post} />
      <div className="divide-y-2 px-2">
        {contents}
        {hasNextPage && (
          <LoadingButton
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            loading={isFetchingNextPage}
            className="w-full text-center"
            variant={"ghost"}
          >
            Load more comments
          </LoadingButton>
        )}
      </div>
    </div>
  )
}
