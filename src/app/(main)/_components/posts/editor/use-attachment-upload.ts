import { useSession } from "@/app/(main)/hooks/useSession"
import { useToast } from "@/components/ui/use-toast"
import { useUploadThing } from "@/lib/ut"
import { encodeImageToBlurhash } from "@/lib/utils"
import { useCallback, useState } from "react"

export type Attachment = {
  file: File
  isUploading: boolean
  attachmentUploadId?: string
}

export function useAttachmentUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const { user } = useSession()

  const { toast } = useToast()

  const [uploadProgress, setUploadProgress] = useState<number>()

  const { isUploading, startUpload } = useUploadThing("postAttachment", {
    onBeforeUploadBegin(files) {
      // const renamed = files.map((file) => {
      //   const ext = file.name.split(".").pop()
      //   return new File(
      //     [file],
      //     `user-attachment_${user.username}_${crypto.randomUUID()}.${ext}`,
      //     { type: file.type },
      //   )
      // })

      setAttachments((prev) => [
        ...prev,
        ...files.map((rf) => ({ file: rf, isUploading: true })),
      ])

      return files
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      // set attachmentUploadId from the server to mark as uploaded
      setAttachments((prev) =>
        prev.map((p) => {
          const uploadResultForThisFile = res.find(
            (r) => r.name === p.file.name,
          )
          if (!uploadResultForThisFile) return p

          return {
            ...p,
            attachmentUploadId: uploadResultForThisFile.serverData.attachmentId,
            isUploading: false,
          }
        }),
      )
    },
    onUploadError(e) {
      setAttachments((prev) => prev.filter((p) => !p.isUploading))
      toast({
        variant: "destructive",
        description: e.message,
      })
    },
  })

  const handleUpload = useCallback(
    async (files: File[]) => {
      if (isUploading) {
        toast({
          variant: "destructive",
          description: "Please wait for the ongoing upload to finish",
        })
        return
      }

      if (attachments.length + files.length > 5) {
        toast({
          variant: "destructive",
          description: "Cant upload more than 5 attachments once.",
        })
        return
      }
      const renamed = files.map((file) => {
        const ext = file.name.split(".").pop()
        return new File(
          [file],
          `user-attachment_${user.username}_${crypto.randomUUID()}.${ext}`,
          { type: file.type },
        )
      })

      const blurhashes = await Promise.all(
        renamed.map(async (file) => {
          if (file.type.startsWith("image")) {
            const hash = await encodeImageToBlurhash(URL.createObjectURL(file))

            console.log({ filename: file.name, hash })
            return { filename: file.name, hash }
          }
          return { filename: file.name, hash: null }
        }),
      )

      startUpload(renamed, blurhashes)
    },
    [isUploading, attachments, toast, startUpload, user.username],
  )

  const removeAttachment = useCallback((filename: string) => {
    setAttachments((prev) => prev.filter((p) => p.file.name !== filename))
  }, [])

  const reset = useCallback(() => {
    setAttachments([])
    setUploadProgress(undefined)
  }, [])

  return {
    startUpload: handleUpload,
    attachments,
    reset,
    removeAttachment,
    isUploading,
    uploadProgress,
  }
}
