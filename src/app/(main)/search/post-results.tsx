"use client"

import { Post } from "@/app/(main)/_components/posts/post"
import PostsSkelton from "@/components/skeletons/posts"
import kyInstance from "@/lib/ky"
import { PostType } from "@/types"
import { useQuery } from "@tanstack/react-query"

export function PostResults({ query }: { query: string }) {
  const { data: posts, status } = useQuery({
    queryKey: ["post-feed", "search-results", query],
    queryFn: () =>
      kyInstance
        .get("/api/search/posts", { searchParams: { q: query } })
        .json<PostType[]>(),
    enabled: !!query,
  })

  if (status === "pending") {
    return <PostsSkelton />
  }

  if (status === "success" && !posts.length) {
    return (
      <p className="text-center text-muted-foreground">
        No posts with the query.
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while getting the search results.
      </p>
    )
  }

  return (
    <div>{posts?.map((post, idx) => <Post post={post} key={post.id} />)}</div>
  )
}
