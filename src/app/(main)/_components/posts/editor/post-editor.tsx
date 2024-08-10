"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useCallback, ClipboardEvent } from "react"
import { useSession } from "@/app/(main)/hooks/useSession"
import { UserAvatar } from "@/components/ui/user-avatar"
import "./styles.css"
import { useOnPostSubmit } from "@/app/(main)/_components/posts/editor/mutation"
import { LoadingButton } from "@/components/ui/loading-button"
import { useAttachmentUpload } from "@/app/(main)/_components/posts/editor/use-attachment-upload"
import { cn, nonNullable } from "@/lib/utils"
import {
  AttachmentAddButton,
  Attachments,
} from "@/app/(main)/_components/posts/editor/editor-attachment"
import { Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useDropzone } from "@uploadthing/react"

export function PostEditor() {
  const mutation = useOnPostSubmit()

  const { user } = useSession()

  const {
    attachments,
    isUploading,
    removeAttachment,
    reset: resetAttachments,
    startUpload,
    uploadProgress,
  } = useAttachmentUpload()

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  })

  const { onClick, ...rootProps } = getRootProps()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Announce something to banish the emptyness here...",
      }),
    ],
  })

  //   const input = useMemo(() => {
  //     return editor?.getText({ blockSeparator: "\n" }) || ""
  //   }, [editor])

  const input = editor?.getText({ blockSeparator: "\n" }) || ""

  const onSubmitPost = useCallback(async () => {
    console.log({ input })
    // await submitPost(input)
    mutation.mutate(
      {
        content: input,
        attachmentIds: attachments
          .map((a) => a.attachmentUploadId)
          // dont pass {attachmentUploadId: undefined} to the action
          .filter(nonNullable),
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent()
          resetAttachments()
        },
      },
    )
  }, [input, editor, mutation, attachments, resetAttachments])

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      console.log("pasted", e.clipboardData)
      const files = Array.from(e.clipboardData.files).filter(
        (f) => f.type.startsWith("image") || f.type.startsWith("video"),
      )
      startUpload(files)
    },
    [startUpload],
  )

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div
          className={cn(
            "w-full rounded-2xl",
            isDragActive && "outline-dashed outline-4",
          )}
          {...rootProps}
        >
          <EditorContent
            editor={editor}
            className="max-h-[20rem] w-full overflow-y-auto rounded-xl bg-background px-5 py-3"
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
        <canvas className="blur-canvas hidden" />
      </div>
      {/* <motion.div
        initial={{ height: 0 }}
        animate={{ height: height || "auto" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div ref={ref}>
          <AnimatePresence initial={false} mode="popLayout">
            {!!attachments.length && (
              <Attachments
                attachments={attachments}
                removeAttachment={removeAttachment}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div> */}
      <AnimatePresence initial={false} mode="popLayout">
        {attachments.length > 0 && (
          <motion.div
            key="attachments"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Attachments
              attachments={attachments}
              removeAttachment={removeAttachment}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-end gap-2">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <AttachmentAddButton
          isDisabled={isUploading || attachments.length >= 5}
          onAttachmentAdd={startUpload}
        />
        <LoadingButton
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          onClick={onSubmitPost}
          className="min-w-20"
        >
          Announce
        </LoadingButton>
      </div>
    </div>
  )
}
