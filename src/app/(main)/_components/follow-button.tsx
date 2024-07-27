"use client"

import { follow } from "@/app/(main)/feed-actions/follow-action"
import { Button } from "@/components/ui/button"
import { ComponentProps } from "react"

export function FollowButton({
  //   className,
  userId,
  ...props
  //   onClick,
}: { userId: string } & ComponentProps<typeof Button>) {
  return (
    <Button
      className={props.className}
      onClick={async () => {
        await follow(userId)
      }}
    >
      Follow
    </Button>
  )
}
