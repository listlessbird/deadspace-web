"use client"

import { Post } from "@/app/(main)/_components/posts/post"
import { useInfinteUserPosts } from "@/app/(main)/hooks/queries"
import PostsSkelton from "@/components/skeletons/posts"
import { InfiniteScrollWrapper } from "@/components/ui/infinite-scroll-wrapper"
import { Loader2 } from "lucide-react"

export function UserPostFeed({ userId }: { userId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfinteUserPosts(userId)

  const posts = data?.pages.flatMap((page) => page.data) || []

  if (status === "pending") {
    return <PostsSkelton />
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return <p className="text-center text-muted-foreground">Empty as a void.</p>
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while loading posts.
      </p>
    )
  }

  return (
    <InfiniteScrollWrapper
      onBottomReached={() => {
        if (hasNextPage && !isFetching) fetchNextPage()
      }}
      className="space-y-5"
    >
      {posts?.map((post, idx) => <Post post={post} key={post.id} />)}

      {/* <pre className="text-destructive">
        <code>{JSON.stringify(posts, null, 2)}</code>
      </pre> */}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollWrapper>
  )
}
