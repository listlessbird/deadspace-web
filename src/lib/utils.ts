import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDate, formatDistanceToNowStrict } from "date-fns"
import { encode } from "blurhash"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeDate(from: Date) {
  const current = new Date()
  // from = new Date(from)
  const delta = current.getTime() - from.getTime()

  if (delta < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true })
  } else if (current.getFullYear() === from.getFullYear()) {
    return formatDate(from, "dd/MM/yyyy")
  } else {
    return formatDate(from, "dd / MM / yyyy")
  }
}

export function formattedNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}

export function nonNullable<T>(
  value: T | null | undefined,
): value is NonNullable<T> {
  return value !== null && value !== undefined
}

const loadImage = async (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (...args) => reject(args)
    img.src = src
  })

const getImageData = (image: HTMLImageElement) => {
  const canvas = document.querySelector(
    "canvas.blur-canvas",
  )! as HTMLCanvasElement
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

export const encodeImageToBlurhash = async (imageUrl: string) => {
  const image = await loadImage(imageUrl)
  const imageData = getImageData(image)
  return encode(imageData.data, imageData.width, imageData.height, 4, 4)
}
