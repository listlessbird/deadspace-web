import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { BookmarksFeed } from "@/app/(main)/bookmarks/bookmarks-feed"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bookmarks",
}

export default function BookmarksPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <BookmarksFeed />
      </div>
      <TrendingSidebar />
    </main>
  )
}
