import { useSession } from "@/app/(main)/hooks/useSession"
import { useToast } from "@/components/ui/use-toast"
import { useUploadThing } from "@/lib/ut"
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
      const renamed = files.map((file) => {
        const ext = file.name.split(".").pop()
        return new File(
          [file],
          `user-attachment_${user.username}_${crypto.randomUUID()}.${ext}`,
          { type: file.type },
        )
      })

      setAttachments((prev) => [
        ...prev,
        ...renamed.map((rf) => ({ file: rf, isUploading: true })),
      ])

      return renamed
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
    onUploadBegin(fileName) {
      if (fileName) return
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
    (files: File[]) => {
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

      startUpload(files)
    },
    [isUploading, attachments, toast, startUpload],
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
