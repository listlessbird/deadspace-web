import React from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { UserAvatar } from "@/components/ui/user-avatar"

const dummyUsers = [
  { id: 1, name: "John Doe", username: "johndoe" },
  { id: 2, name: "Jane Smith", username: "janesmith" },
  { id: 3, name: "Alice Johnson", username: "alicej" },
  { id: 4, name: "Bob Williams", username: "bobw" },
]

export const MentionBox = ({
  onSelect,
  mention,
}: {
  onSelect: (user: (typeof dummyUsers)[0]) => void
  mention: string
}) => {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandList>
        <CommandEmpty>No users found.</CommandEmpty>
        <CommandGroup>
          {dummyUsers.map((user) => (
            <CommandItem
              key={user.id}
              onSelect={() => onSelect(user)}
              className="flex items-center space-x-2 px-4 py-2"
            >
              <UserAvatar avatarUrl={undefined} />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
