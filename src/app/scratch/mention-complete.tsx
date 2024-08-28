import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

export function AutocompleteDropdown<T extends string>({
  suggestions,
  onSelect,
  inputRef,
  onOpenChange,
}: {
  suggestions: T[]
  onSelect: (item: T) => void
  inputRef: React.RefObject<HTMLInputElement>
  onOpenChange: (isOpen: boolean) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  const dropdownref = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    setActiveIndex(0)
  }, [suggestions])
  useEffect(() => {
    const input = inputRef.current

    function handleKeyInput(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % suggestions.length)
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        )
      }

      if (e.key === "Enter") {
        e.preventDefault()
        onSelect(suggestions[activeIndex])
        input?.focus()
      }
    }

    input?.addEventListener("keydown", handleKeyInput)

    return () => {
      input?.removeEventListener("keydown", handleKeyInput)
    }
  }, [inputRef, suggestions, activeIndex, onSelect])

  useEffect(() => {
    const dropdown = dropdownref.current

    function handleClick(e: MouseEvent) {
      if (dropdown && !dropdown.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [onOpenChange])

  return (
    <ul
      ref={dropdownref}
      className="absolute flex w-fit flex-col gap-2 rounded border bg-background p-1 py-2 shadow-md"
    >
      {suggestions.map((item) => (
        <li
          key={item}
          data-active={suggestions[activeIndex] === item}
          className={cn(
            'text-white data-[active="true"]:bg-blue-400',
            "w-full cursor-pointer rounded-md px-4 py-1 hover:bg-blue-400",
          )}
          onClick={() => {
            onSelect(item)
            inputRef.current?.focus()
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
