import { UserAvatar } from "@/components/ui/user-avatar"
import { cn } from "@/lib/utils"
import { NotificationType } from "@/types"
import { HeartIcon, MessageCircle, User2 } from "lucide-react"
import Link from "next/link"

export function Notification({
  notification,
}: {
  notification: NotificationType
}) {
  // ignore system notifications for now as they are not implemented
  const map: Record<
    Exclude<NotificationType["notification"]["type"], "system">,
    {
      message: string
      icon: JSX.Element
      href: string
    }
  > = {
    "comment-like": {
      message: notification.notification.content,
      icon: <HeartIcon className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.notification.resourceId}`,
    },
    "post-like": {
      message: notification.notification.content,
      icon: <HeartIcon className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.notification.resourceId}`,
    },

    "comment-reply": {
      message: notification.notification.content,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.notification.resourceId}`,
    },

    "post-comment": {
      message: notification.notification.content,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.notification.resourceId}`,
    },

    follow: {
      message: notification.notification.content,
      icon: <User2 className="size-7 text-primary" />,
      href: `/user/${notification.notification.resourceId}`,
    },

    mention: {
      message: notification.notification.content,
      icon: <HeartIcon />,
      href: `/posts/${notification.notification.resourceId}`,
    },
  }

  const { message, icon, href } =
    map[notification.notification.type as keyof typeof map]

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.notification.read && "bg-primary/10",
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer?.avatarUrl} />
          <div>
            <span className="font-bold">
              {notification.issuer?.displayName ??
                notification.issuer?.username}
            </span>
            <span>{message}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
