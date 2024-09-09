import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { Agents } from "@/app/(main)/agents/agents"

export default function AgentsPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Agents />
      </div>
      <TrendingSidebar />
    </main>
  )
}
