"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useCallback, useMemo } from "react"
import { submitPost } from "@/app/(main)/_components/posts/editor/action"
import { useSession } from "@/app/(main)/hooks/useSession"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Button } from "@/components/ui/button"
import "./styles.css"
import { useOnPostSubmit } from "@/app/(main)/_components/posts/editor/mutation"
import { LoadingButton } from "@/components/ui/loading-button"

export function PostEditor() {
  const mutation = useOnPostSubmit()

  const { user } = useSession()
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Announce something to the emptyness here...",
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
    mutation.mutate(input, {
      onSuccess: () => {
        editor?.commands.clearContent()
      },
    })
  }, [input, editor, mutation])

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className="max-h-[20rem] w-full overflow-y-auto rounded-xl bg-background px-5 py-3"
        />
      </div>
      <div className="flex justify-end">
        <LoadingButton
          loading={mutation.isPending}
          disabled={!input.trim()}
          onClick={onSubmitPost}
          className="min-w-20"
        >
          Announce
        </LoadingButton>
      </div>
    </div>
  )
}
