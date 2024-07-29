"use client"

import { follow, unFollow } from "@/app/(main)/feed-actions/follow-action"
import { useFollowerInfo } from "@/app/(main)/hooks/useFollowInfo"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { FollowerData } from "@/types"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import { ComponentProps, useMemo } from "react"

export function FollowButton({
  //   className,
  userId,
  initialState,
  ...props
  //   onClick,
}: { userId: string; initialState: FollowerData } & ComponentProps<
  typeof Button
>) {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const { data } = useFollowerInfo(userId, initialState)

  const queryKey: QueryKey = useMemo(() => ["follower-info", userId], [userId])

  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isFollowing ? unFollow(userId) : follow(userId)
    },

    onMutate: async () => {
      // optimistic update
      await queryClient.cancelQueries({ queryKey })

      // get the previous state

      const previousState = queryClient.getQueryData<FollowerData>(queryKey)

      // set the new state depending on the previous state (followed/unfollow)

      queryClient.setQueryData<FollowerData>(queryKey, () => ({
        followerCount:
          (previousState?.followerCount || 0) +
          (previousState?.isFollowing ? -1 : 1),
        isFollowing: !previousState?.isFollowing,
      }))

      return { previousState }
    },

    onError: (_, __, ctx) => {
      // rollback on error

      queryClient.setQueryData<FollowerData>(queryKey, ctx?.previousState)
      console.error(_)
      toast({ variant: "destructive", description: "Something went wrong" })
    },
  })

  return (
    <Button
      variant={data.isFollowing ? "secondary" : "default"}
      className={props.className}
      onClick={() => mutate()}
    >
      {data.isFollowing ? "Unfollow" : "Follow"}
    </Button>
  )
}
