"use client"

import { Post } from "@/app/(main)/_components/posts/post"
import { useInfinitePosts, usePosts } from "@/app/(main)/hooks/queries"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function Feed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfinitePosts()

  const posts = data?.pages.flatMap((page) => page.data) || []

  if (status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while loading posts.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {posts?.map((post, idx) => <Post post={post} key={post.id} />)}

      {/* <pre className="text-destructive">
        <code>{JSON.stringify(posts, null, 2)}</code>
      </pre> */}
      <Button onClick={() => fetchNextPage()}>Load More</Button>
    </div>
  )
}
