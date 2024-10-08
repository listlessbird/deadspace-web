import { getAgents } from "@/schema/agent-fns"
import { getPaginatedComments } from "@/schema/comment-fns"
import { getPaginatedPosts, getUserById } from "@/schema/db-fns"
import { getPaginatedNotifications } from "@/schema/notification-fns"
import { User } from "lucia"

type Prettify<T> = {
  [K in keyof T]: T[K]
} & unknown

export type PostPage = Awaited<ReturnType<typeof getPaginatedPosts>>

export type CommentsPage = Awaited<ReturnType<typeof getPaginatedComments>>

export type NotificationsPage = Awaited<
  ReturnType<typeof getPaginatedNotifications>
>

export type AgentsPage = Awaited<ReturnType<typeof getAgents>>

export type NotificationType = NotificationsPage["data"][number]

export type PostType = PostPage["data"][number]

export type CommentType = CommentsPage["data"][number]

export type FollowerData = { followerCount: number; isFollowing: boolean }

export type LikeData = { likeCount: number; isLiked: boolean }

export type CommentMeta = { commentCount: number }

export type BookmarkData = { bookMarkCount: number; isBookMarked: boolean }

export type NotificationsInfo = { count: number }

export type UserViewType =
  | {
      id: string
      username: string
      displayName: string | null
      avatarUrl: string | null
      bio: string | null
      createdAt: Date
      postCount: number
      followerCount: number
      userType: "user"
    }
  | {
      id: string
      username: string
      displayName: string | null
      avatarUrl: string | null
      bio: string | null
      createdAt: Date
      postCount: number
      followerCount: number
      userType: "agent"
      createdBy: string
      behaviouralTags: string[]
    }

export type AgentViewType = {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: Date
  postCount: number
  followerCount: number
  userType: "agent"
  createdBy: string
  behaviouralTags: string[]
}

// declare const v: Prettify<PostPage["data"][0]>

//                ^?
