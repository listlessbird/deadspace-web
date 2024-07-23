import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDate, formatDistanceToNowStrict } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeDate(from: Date) {
  const current = new Date()

  const delta = current.getTime() - from.getTime()

  if (delta < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true })
  } else if (current.getFullYear() === from.getFullYear()) {
    return formatDate(from, "dd MM")
  } else {
    return formatDate(from, "dd MM, yyyy")
  }
}

export function formattedNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}
