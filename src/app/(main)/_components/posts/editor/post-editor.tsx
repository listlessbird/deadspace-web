"use client"

import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useCallback, ClipboardEvent, useState, useEffect, useRef } from "react"
import { useSession } from "@/app/(main)/hooks/use-session"
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
import { AutocompleteDropdown } from "@/app/(main)/_components/posts/editor/mention-complete"
import { useUserQuery } from "@/app/(main)/hooks/queries"
import { useDebounce } from "@/app/hooks/use-debounce"

export function PostEditor() {
  const mutation = useOnPostSubmit()
  const { user } = useSession()

  const [query, setQuery] = useState("")

  const debouncedQuery = useDebounce(query)

  const editorRef = useRef<HTMLDivElement | null>(null)

  const [showUserSuggestions, setShowUserSuggestions] = useState(false)

  const { data, isLoading } = useUserQuery(debouncedQuery)

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
    onUpdate: ({ editor }) => {
      const { state } = editor
      const { selection } = state
      const { $from } = selection

      // Get the current line's text
      const currentLineText = $from.nodeBefore?.textContent || ""

      // Check if we're in a mention context
      const mentionMatch = currentLineText.match(/@(\w*)$/)
      if (mentionMatch) {
        const mentionString = mentionMatch[1]
        if (mentionString.length > 0) {
          setQuery(mentionString)
          setShowUserSuggestions(true)
        }
      } else {
        setQuery("")
        setShowUserSuggestions(false)
      }
    },
  })

  const handleSelect = useCallback(
    (user: string) => {
      if (editor) {
        const { state } = editor
        const { selection } = state
        const { $from, $to } = selection

        let start = $from.pos
        let textBefore = $from.nodeBefore?.textContent || ""
        let mentionStart = textBefore.lastIndexOf("@")

        if (mentionStart !== -1) {
          start = start - (textBefore.length - mentionStart)
        }

        editor
          .chain()
          .focus()
          .deleteRange({ from: start, to: $to.pos })
          .insertContent(`@${user} `)
          .run()
      }

      setQuery("")
      setShowUserSuggestions(false)
    },
    [editor],
  )

  const input = editor?.getText({ blockSeparator: "\n" }) || ""

  const onSubmitPost = useCallback(async () => {
    mutation.mutate(
      {
        content: input,
        attachmentIds: attachments
          .map((a) => a.attachmentUploadId)
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
            ref={editorRef}
          />

          {showUserSuggestions && (
            <AutocompleteDropdown
              suggestions={data?.map((u) => u.username) || []}
              onSelect={handleSelect}
              inputRef={editorRef}
              onOpenChange={setShowUserSuggestions}
            />
          )}

          <input {...getInputProps()} />
        </div>
        <canvas className="blur-canvas hidden" />
      </div>

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
