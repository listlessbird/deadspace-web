import kyInstance from "@/lib/ky"
import { LikeData } from "@/types"
import { useQuery } from "@tanstack/react-query"

export function usePostLikeInfo(postId: string, initialState: LikeData) {
  const q = useQuery({
    queryKey: ["post-like-info", postId],
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeData>(),
    initialData: initialState,
    staleTime: Infinity,
  })

  return q
}
