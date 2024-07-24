import kyInstance from "@/lib/ky"
import { PostWithUsers } from "@/schema/db-fns"
import { PostPage } from "@/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

export function usePosts() {
  return useQuery<PostWithUsers[]>({
    queryKey: ["posts", "posts-feed"],
    queryFn: kyInstance.get("/api/posts/feed").json<PostWithUsers[]>,
  })
}

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite-posts", "post-feed"],
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
