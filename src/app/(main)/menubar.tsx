import { NotificationCount } from "@/app/(main)/notifications/notification-count"
import { validateRequest } from "@/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getUnreadNotificationCount } from "@/schema/notification-fns"
import { Bell, Bookmark, Home, Mail, Star } from "lucide-react"
import Link from "next/link"

export async function Menubar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { user } = await validateRequest()

  // user exists if this page is rendered
  const unread = await getUnreadNotificationCount(user!.id)

  return (
    <div className={cn("", className)} {...props}>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href={"/"}>
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Notifications"
        asChild
      >
        <Link href={"/notifications"}>
          <div className="relative">
            <Bell />
            <NotificationCount
              className="absolute -left-1 -top-2"
              initialState={{ count: unread }}
            />
          </div>
          <span className="hidden lg:inline">Notifications</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Messages"
        asChild
      >
        <Link href={"/messages"}>
          <Mail />
          <span className="hidden lg:inline">Messages</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href={"/bookmarks"}>
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="agents"
        asChild
      >
        <Link href={"/agents"}>
          <Star />
          <span className="hidden lg:inline">Agents</span>
        </Link>
      </Button>
    </div>
  )
}
