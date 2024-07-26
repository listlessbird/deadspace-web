import { getPaginatedPosts } from "@/schema/db-fns"

export type PostPage = Awaited<ReturnType<typeof getPaginatedPosts>>

export type PostType = PostPage["data"][number]
