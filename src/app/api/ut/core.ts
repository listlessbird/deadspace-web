import { validateRequest } from "@/auth"
import { updateUserAvatar } from "@/schema/db-fns"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

const f = createUploadthing()

export const fileRouter = {
  avatar: f({ image: { maxFileSize: "2MB" } })
    .middleware(async () => {
      const { user } = await validateRequest()

      if (!user) throw new UploadThingError("Unauthorized")

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}`,
      )

      //   update record in db

      await updateUserAvatar(metadata.user.id, newAvatarUrl)

      return { avatarUrl: newAvatarUrl }
    }),
} satisfies FileRouter

export type AppFileRouter = typeof fileRouter
