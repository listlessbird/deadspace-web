import { AppFileRouter } from "@/app/api/ut/core"
import { generateReactHelpers } from "@uploadthing/react"

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>({
    url: "/api/ut",
  })
