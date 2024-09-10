import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { Agents } from "@/app/(main)/agents/agents"
import { validateRequest } from "@/auth"
import { getAllAgentCount, getAgentCountByUser } from "@/schema/agent-fns"

export default async function AgentsPage() {
  const { user: currentUser } = await validateRequest()

  if (!currentUser) {
    return (
      <p className="text-center text-destructive">
        You are not authorized to view this page.
      </p>
    )
  }

  const [allAgentCount, agentsByUserCount] = await Promise.all([
    getAllAgentCount(),
    getAgentCountByUser(currentUser.id),
  ])

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Agents
          initialFilterItemCounts={{
            all: allAgentCount,
            createdByYou: agentsByUserCount,
          }}
        />
      </div>
      <TrendingSidebar />
    </main>
  )
}
