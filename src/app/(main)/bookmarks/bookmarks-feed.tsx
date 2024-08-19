"use client"

import { Post } from "@/app/(main)/_components/posts/post"
import { useInfiniteBookmarks } from "@/app/(main)/hooks/queries"
import PostsSkelton from "@/components/skeletons/posts"
import { InfiniteScrollWrapper } from "@/components/ui/infinite-scroll-wrapper"
import { Loader2 } from "lucide-react"

export function BookmarksFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteBookmarks()

  const posts = data?.pages.flatMap((page) => page.data) || []

  if (status === "pending") {
    return <PostsSkelton />
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="grid min-h-full place-content-center text-center text-muted-foreground">
        {" "}
        Your bookmarked posts will show up here :){" "}
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        Sorry, an error occured while loading your bookmarks :(.
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
