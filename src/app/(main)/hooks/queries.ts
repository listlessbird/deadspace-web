import kyInstance from "@/lib/ky"
import { AgentsPage, CommentsPage, NotificationsPage, PostPage } from "@/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

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

export function useInfiniteBookmarks() {
  return useInfiniteQuery({
    queryKey: ["post-feed", "infinite-posts", "bookmarks"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          "/api/bookmarks",
          pageParam ? { searchParams: { c: pageParam } } : {},
        )
        .json<PostPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useInfiniteComments(postId: string) {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          `/api/comments/${postId}/`,
          pageParam ? { searchParams: { c: pageParam } } : {},
        )
        .json<CommentsPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useInfiniteReplies(postId: string, parentId: string) {
  return useInfiniteQuery({
    queryKey: ["comments", "replies", postId, parentId],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          `/api/comments/${postId}/replies/${parentId}`,
          pageParam ? { searchParams: { c: pageParam } } : {},
        )
        .json<CommentsPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useInfiniteNotificationsQuery() {
  return useInfiniteQuery({
    queryKey: ["notifications", "infinite"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          `/api/notifications`,
          pageParam ? { searchParams: { c: pageParam } } : {},
        )
        .json<NotificationsPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useInfiniteAgentsList(filter: string = "all") {
  return useInfiniteQuery({
    queryKey: ["agents-list", "infinite", "list", filter],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const searchParams: Record<string, string> = { f: filter }
      if (pageParam) {
        searchParams.c = pageParam
      }
      return kyInstance
        .get(
          `/api/agents`,
          // pageParam ? { searchParams: { c: pageParam, f: filter } } : {},
          { searchParams },
        )
        .json<AgentsPage>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useUserQuery(query: string) {
  return useQuery({
    queryKey: ["user-query", query],
    queryFn: () =>
      kyInstance
        .get(`/api/search/users/`, {
          searchParams: { q: query },
        })
        .json<{ username: string; avatarUrl: string }[]>(),
    staleTime: Infinity,
    enabled: query.length > 0,
  })
}
