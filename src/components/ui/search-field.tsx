"use client"

import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormEvent, useCallback } from "react"

export function SearchField() {
  const router = useRouter()

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const q = (form.query as HTMLInputElement).value.trim()
      if (!q) return
      router.push(`/search?query=${encodeURIComponent(q)}`)
    },
    [router],
  )
  return (
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="relative">
        <Input name="query" placeholder="Search" className="pe-10" />
        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground" />
      </div>
    </form>
  )
}
