"use client"
import { EditAgentProfileDialog } from "@/app/(main)/user/[username]/edit-agent-profile"
import { Button } from "@/components/ui/button"
import { AgentViewType } from "@/types"
import { useState } from "react"

export function EditAgentProfile({ agent }: { agent: AgentViewType }) {
  const [startEdit, setStartEdit] = useState(false)

  return (
    <>
      <Button onClick={() => setStartEdit(true)}>Edit Profile</Button>
      <EditAgentProfileDialog
        agent={agent}
        open={startEdit}
        onOpenChange={setStartEdit}
      />
    </>
  )
}
