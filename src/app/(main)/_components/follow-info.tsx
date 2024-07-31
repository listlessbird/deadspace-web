"use client"

import { useFollowerInfo } from "@/app/(main)/hooks/useFollowInfo"
import { formattedNumber } from "@/lib/utils"
import { FollowerData } from "@/types"

export function FollowerCount({
  userId,
  initialState,
}: {
  userId: string
  initialState: FollowerData
}) {
  const { data } = useFollowerInfo(userId, initialState)

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">
        {formattedNumber(data.followerCount)}
      </span>
    </span>
  )
}
