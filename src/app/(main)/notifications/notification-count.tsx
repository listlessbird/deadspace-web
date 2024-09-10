"use client"
import { useNotificationsInfo } from "@/app/(main)/hooks/use-notification-info"
import { MotionNumber } from "@/components/ui/motion-number"
import { cn } from "@/lib/utils"
import { NotificationsInfo } from "@/types"

export function NotificationCount({
  className,
  initialState,
}: {
  initialState: NotificationsInfo
  className?: string
}) {
  const { data } = useNotificationsInfo(initialState)
  return (
    <div
      className={cn(
        "flex aspect-square size-5 items-center justify-center rounded-full bg-primary data-[hascount='false']:hidden",
        className,
      )}
      data-hascount={data.count > 0}
    >
      <MotionNumber value={data.count} className="text-sm text-white" />
    </div>
  )
}
