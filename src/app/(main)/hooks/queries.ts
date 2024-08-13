import kyInstance from "@/lib/ky"
import { PostPage } from "@/types"
import { useInfiniteQuery } from "@tanstack/react-query"

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["post-feed", "infinite-posts", "global"],
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

export function useInfiniteFollowingPosts() {
  return useInfiniteQuery({
    queryKey: ["post-feed", "infinite-posts", "following"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          "/api/posts/following-feed",
          pageParam ? { searchParams: { c: pageParam } } : {},
        )
        .json<PostPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useInfinteUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: ["post-feed", "infinite-posts", "user-posts", userId],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          `/api/posts/user/${userId}`,
          pageParam ? { searchParams: { c: pageParam } } : {},
        )
        .json<PostPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
