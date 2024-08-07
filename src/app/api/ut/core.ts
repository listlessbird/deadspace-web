import { validateRequest } from "@/auth"
import { createMediaAttachmentEntry, updateUserAvatar } from "@/schema/db-fns"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError, UTApi } from "uploadthing/server"

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
      const currentAvatar = metadata.user.avatarUrl

      if (currentAvatar) {
        const utKey = currentAvatar.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1]

        utApi.deleteFiles(utKey)
      }

      // const newAvatarUrl = file.url.replace(
      //   "/f/",
      //   `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      // )
      const newAvatarUrl = cleanUtUrl(file.url)

      //   update record in db

      await updateUserAvatar(metadata.user.id, newAvatarUrl)

      return { avatarUrl: newAvatarUrl }
    }),
  postAttachment: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      const { user } = await validateRequest()

      if (!user) throw new UploadThingError("Unauthorized")

      return { user }
    })
    .onUploadComplete(async ({ file }) => {
      const media = await createMediaAttachmentEntry({
        attachmentUrl: cleanUtUrl(file.url),
        attachmentType: file.type.startsWith("image") ? "image" : "video",
      })

      // pass the media id to the frontend

      return { attachmentId: media.id }
    }),
} satisfies FileRouter

function cleanUtUrl(url: string) {
  return url.replace("/f/", `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)
}

export const utApi = new UTApi()

export type AppFileRouter = typeof fileRouter
