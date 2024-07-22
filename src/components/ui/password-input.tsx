import { Input, InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [shown, show] = useState(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={shown ? "text" : "password"}
          className={cn("pe-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={(e) => show((p) => !p)}
          title={shown ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {shown ? <EyeOff /> : <Eye />}

          {/* {shown ? "🙈" : "👁️"} */}
        </button>
      </div>
    )
  },
)

PasswordInput.displayName = "PasswordInput"
