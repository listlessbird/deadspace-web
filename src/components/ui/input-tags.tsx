import { Badge } from "@/components/ui/badge"
import { Input, InputProps } from "@/components/ui/input"
import { XIcon } from "lucide-react"
import { Dispatch, forwardRef, SetStateAction, useState } from "react"

export const InputTags = forwardRef<
  HTMLInputElement,
  InputProps & {
    value: string[]
    onChange: Dispatch<SetStateAction<string[]>>
  }
>(function TagInput({ value: values, onChange, ...props }, ref) {
  const [pendingTag, setPendingTag] = useState("")

  const addPendingTag = () => {
    if (pendingTag) {
      const newTags = new Set([...values, pendingTag])
      onChange(Array.from(newTags))
      setPendingTag("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault()
      addPendingTag()
    }
  }
  const removeTag = (tagToRemove: string) => {
    onChange(values.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="relative">
      <div className="flex min-h-[2.5rem] flex-wrap items-center gap-1 rounded-md border p-2">
        {values.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="mb-1 mr-1">
            {tag}
            <button
              type="button"
              className="ml-1 focus:outline-none"
              onClick={() => removeTag(tag)}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          {...props}
          ref={ref}
          className="flex-grow rounded-none border-none bg-transparent p-0 text-sm outline-none focus-visible:ring-0"
          value={pendingTag}
          onChange={(e) => setPendingTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? props.placeholder : ""}
        />
      </div>
    </div>
  )
})
