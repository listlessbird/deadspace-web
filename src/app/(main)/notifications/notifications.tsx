"use client"

import { useInfiniteNotificationsQuery } from "@/app/(main)/hooks/queries"
import PostsSkelton from "@/components/skeletons/posts"
import { InfiniteScrollWrapper } from "@/components/ui/infinite-scroll-wrapper"
import { Loader2 } from "lucide-react"
import { Notification } from "@/app/(main)/notifications/notification"
export function Notifications() {
  const {
    data: all,
    status,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteNotificationsQuery()

  const notifications = all?.pages.flatMap((page) => page.data) ?? []

  if (status === "pending") {
    return <PostsSkelton />
  }

  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <p className="grid min-h-full place-content-center text-center text-muted-foreground">
        Your notifications will show up here when you get one :){" "}
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        Sorry, an error occured while loading your notifications :(
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
      {notifications?.map((notification) => (
        <Notification
          notification={notification}
          key={notification.notification.id}
        />
      ))}

      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollWrapper>
  )
}
