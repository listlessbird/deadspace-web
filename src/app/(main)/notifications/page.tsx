import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { Notifications } from "@/app/(main)/notifications/notifications"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notifications",
}

export default function BookmarksPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Notifications />
      </div>
      <TrendingSidebar />
    </main>
  )
}
