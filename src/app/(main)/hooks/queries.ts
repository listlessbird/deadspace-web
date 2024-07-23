import kyInstance from "@/lib/ky"
import { PostWithUsers } from "@/schema/db-fns"
import { useQuery } from "@tanstack/react-query"

export function usePosts() {
  return useQuery<PostWithUsers[]>({
    queryKey: ["posts", "posts-feed"],
    queryFn: kyInstance.get("/api/posts/feed").json<PostWithUsers[]>,
  })
}
