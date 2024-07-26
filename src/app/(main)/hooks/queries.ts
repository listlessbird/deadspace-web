import kyInstance from "@/lib/ky"
import { PostPage } from "@/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["post-feed", "infinite-posts"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          "/api/posts/feed",
          pageParam ? { searchParams: { c: pageParam } } : {},
        )
        .json<PostPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
