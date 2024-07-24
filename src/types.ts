import { getPaginatedPosts } from "@/schema/db-fns"

export type PostPage = Awaited<ReturnType<typeof getPaginatedPosts>>
