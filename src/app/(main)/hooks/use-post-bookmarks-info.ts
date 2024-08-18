import kyInstance from "@/lib/ky"
import { BookmarkData } from "@/types"
import { useQuery } from "@tanstack/react-query"

export function usePostBookmarkInfo(
  postId: string,
  initialState: BookmarkData,
) {
  const q = useQuery({
    queryKey: ["post-bookmark-info", postId],
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<BookmarkData>(),
    initialData: initialState,
    staleTime: Infinity,
  })

  return q
}
