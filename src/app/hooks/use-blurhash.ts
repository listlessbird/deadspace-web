import { blurHashToDataURL } from "@/lib/blurhash-to-data-url"
import { useMemo } from "react"

export function useBlurHash(blurhash: string) {
  return useMemo(() => {
    if (blurhash) {
      return blurHashToDataURL(blurhash)
    }
    return null
  }, [blurhash])
}
