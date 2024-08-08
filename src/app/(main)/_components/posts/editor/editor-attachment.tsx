import { Attachment } from "@/app/(main)/_components/posts/editor/use-attachment-upload"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { useMemo, useRef } from "react"

export function AttachmentAddButton({
  onAttachmentAdd,
  isDisabled,
}: {
  onAttachmentAdd: (files: File[]) => void
  isDisabled: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Button
        variant={"ghost"}
        size={"icon"}
        disabled={isDisabled}
        className="rounded-full text-primary/60 hover:text-primary"
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*,video/*"
        className="sr-only hidden"
        ref={inputRef}
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files ? e.target.files : [])
          if (files.length) {
            onAttachmentAdd(files)
            e.target.value = ""
          }
        }}
      />
    </>
  )
}

export function Attachments({
  attachments,
  removeAttachment,
}: {
  attachments: Attachment[]
  removeAttachment: (filename: string) => void
}) {
  return (
    <motion.div
      layout
      className={cn(
        "relative flex flex-col gap-3",
        attachments?.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <motion.div key={attachment.file.name}>
          <AttachmentPreview
            attachment={attachment}
            onRemoveAttachment={() => removeAttachment(attachment.file.name)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

function AttachmentPreview({
  attachment: { file, isUploading },
  onRemoveAttachment,
}: {
  attachment: Attachment
  onRemoveAttachment: () => void
}) {
  const src = useMemo(() => URL.createObjectURL(file), [file])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isUploading ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative mx-auto size-fit rounded-md",
        // isUploading && "opacity-50",
      )}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment Preview"
          width={500}
          className="size-fit max-h-[25rem] rounded-2xl"
          height={500}
        />
      ) : (
        <video controls className="size-fit max-h-[25rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        // dont allow remove while uploading
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemoveAttachment}
          className="absolute right-3 top-3 rounded-full bg-foreground p-2 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </motion.button>
      )}
    </motion.div>
  )
}
