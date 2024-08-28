import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function AutocompleteDropdown<T extends string>({
  suggestions,
  onSelect,
  inputRef,
}: {
  suggestions: T[]
  onSelect: (item: T) => void
  inputRef: React.RefObject<HTMLInputElement>
}) {
  const [activeIndex, setActiveIndex] = useState(0)
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
      }
    }

    input?.addEventListener("keydown", handleKeyInput)

    return () => {
      input?.removeEventListener("keydown", handleKeyInput)
    }
  }, [inputRef, suggestions, activeIndex, onSelect])

  return (
    <ul className="absolute flex w-fit flex-col gap-2 rounded border bg-background p-1 py-2 shadow-md">
      {suggestions.map((item) => (
        <li
          key={item}
          data-active={suggestions[activeIndex] === item}
          className={cn(
            'text-white data-[active="true"]:bg-blue-400',
            "w-full cursor-pointer rounded-md px-4 py-1",
          )}
          onClick={() => {
            onSelect(item)
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
