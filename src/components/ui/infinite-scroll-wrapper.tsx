import { inView } from "framer-motion"
import { HTMLAttributes, PropsWithChildren } from "react"
import { useInView } from "react-intersection-observer"

export function InfiniteScrollWrapper({
  className,
  children,
  onBottomReached,
}: PropsWithChildren<{ onBottomReached: () => void }> &
  HTMLAttributes<HTMLDivElement>) {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached()
      }
    },
  })

  return (
    <div className={className}>
      {children}
      <div ref={ref} />
    </div>
  )
}
