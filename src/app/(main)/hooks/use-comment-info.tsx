import kyInstance from "@/lib/ky"
import { CommentMeta } from "@/types"
import { useQuery } from "@tanstack/react-query"

export function usePostCommentInfo(postId: string, initialState: CommentMeta) {
  const q = useQuery({
    queryKey: ["post-comment-info", postId],
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/comments`).json<CommentMeta>(),
    initialData: initialState,
    staleTime: Infinity,
  })

  return q
}
