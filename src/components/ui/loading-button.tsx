import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"

interface LoadingButtonProps extends ButtonProps {
  loading: boolean
}

export function LoadingButton({
  children,
  className,
  loading,
  disabled,
  ...props
}: LoadingButtonProps) {
  const buttonStates = useMemo(
    () => ({
      idle: children,
      loading: <Loader2 className="size-5 animate-spin" />,
    }),
    [children],
  )

  return (
    <Button
      disabled={loading || disabled}
      className={cn("", className)}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          key={loading ? "loading" : "idle"}
        >
          {buttonStates[loading ? "loading" : "idle"]}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}
