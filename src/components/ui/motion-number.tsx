import { useState, useEffect, ComponentPropsWithoutRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({
    y: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
}

export function MotionNumber({
  value,
  className,
}: { value: number } & ComponentPropsWithoutRef<typeof motion.span>) {
  const [displayValue, setDisplayValue] = useState(value)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    setDirection(value > displayValue ? 1 : -1)
    setDisplayValue(value)
  }, [value, displayValue])

  return (
    <div className="relative inline-flex h-5 items-center pe-2">
      <AnimatePresence initial={false} custom={direction}>
        <motion.span
          key={displayValue}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          custom={direction}
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className={cn(
            "absolute inset-0 inline-block size-full tabular-nums",
            className,
          )}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
