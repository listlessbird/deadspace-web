import { getPaginatedPosts, getUserById } from "@/schema/db-fns"
import { User } from "lucia"

type Prettify<T> = {
  [K in keyof T]: T[K]
} & unknown

export type PostPage = Awaited<ReturnType<typeof getPaginatedPosts>>

export type PostType = PostPage["data"][number]

export type FollowerData = { followerCount: number; isFollowing: boolean }

export type UserViewType = Awaited<ReturnType<typeof getUserById>> & {
  followerCount: number
  postCount: number
}

declare const v: Prettify<UserViewType>
//                ^?
