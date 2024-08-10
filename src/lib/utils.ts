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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (...args) => reject(args)
    img.src = src
  })
}

function getImageData(image: HTMLImageElement, canvas: HTMLCanvasElement) {
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

function compressImage(
  canvas: HTMLCanvasElement,
  sourceImg: HTMLImageElement,
  ratio = 50,
  quality = 50,
  maxWidth = 0,
  maxHeight = 0,
): void {
  const ctx = canvas.getContext("2d")!

  quality = quality / 100
  ratio = ratio / 100

  const w = sourceImg.naturalWidth
  const h = sourceImg.naturalHeight

  const xfactor = maxWidth ? maxWidth / w : 1
  const yfactor = maxHeight ? maxHeight / h : 1

  ratio = Math.min(ratio, xfactor, yfactor)

  canvas.width = w * ratio
  canvas.height = h * ratio

  ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height)
}

export async function encodeCompressedImageToBlurhash(
  imageUrl: string,
  ratio = 50,
  quality = 50,
  maxWidth = 0,
  maxHeight = 0,
) {
  const image = await loadImage(imageUrl)
  const canvas = document.createElement("canvas")

  compressImage(canvas, image, ratio, quality, maxWidth, maxHeight)

  const imageData = getImageData(image, canvas)

  return encode(imageData.data, imageData.width, imageData.height, 4, 4)
}
