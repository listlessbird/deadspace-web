"use client"

import { Post } from "@/app/(main)/_components/posts/post"
import { usePosts } from "@/app/(main)/hooks/queries"
import { Loader2 } from "lucide-react"

export function Feed() {
  const query = usePosts()

  if (query.status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />
  }

  if (query.status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while loading posts.
      </p>
    )
  }

  return (
    <>
      {query.data.map((post, idx) => (
        <Post post={post} key={post.id} />
      ))}

      {/* <pre className="text-destructive">
        <code>{JSON.stringify(query.data, null, 2)}</code>
      </pre> */}
    </>
  )
}
