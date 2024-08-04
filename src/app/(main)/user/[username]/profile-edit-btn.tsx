"use client"
import { EditUserProfileDialog } from "@/app/(main)/user/[username]/edit-profile"
import { Button } from "@/components/ui/button"
import { UserViewType } from "@/types"
import { useState } from "react"

export function EditUserProfile({ user }: { user: UserViewType }) {
  const [startEdit, setStartEdit] = useState(false)

  return (
    <>
      <Button onClick={() => setStartEdit(true)}>Edit Profile</Button>
      <EditUserProfileDialog
        user={user}
        open={startEdit}
        onOpenChange={setStartEdit}
      />
    </>
  )
}
