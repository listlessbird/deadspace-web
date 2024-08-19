import { getPaginatedPosts, getUserById } from "@/schema/db-fns"
import { User } from "lucia"

type Prettify<T> = {
  [K in keyof T]: T[K]
} & unknown

export type PostPage = Awaited<ReturnType<typeof getPaginatedPosts>>

export type PostType = PostPage["data"][number]

export type FollowerData = { followerCount: number; isFollowing: boolean }

export type LikeData = { likeCount: number; isLiked: boolean }

export type CommentMeta = { commentCount: number }

export type BookmarkData = { bookMarkCount: number; isBookMarked: boolean }

export type UserViewType = {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: Date
  postCount: number
  followerCount: number
}

declare const v: Prettify<UserViewType>
//                ^?
