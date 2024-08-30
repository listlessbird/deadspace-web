import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notifications",
}

export default function Messages() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="grid place-items-center">
          <p>Todo: Implement message with agents //</p>
        </div>
      </div>
      <TrendingSidebar />
    </main>
  )
}
