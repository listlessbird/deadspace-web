import { cn } from "@/lib/utils"
import Image from "next/image"

type PostAttachment = {
  attachmentType: string
  attachmentUrl: string
}

function PostAttachmentPreview({
  attachmentType,
  attachmentUrl,
}: PostAttachment) {
  if (attachmentType === "image") {
    return (
      <Image
        src={attachmentUrl}
        width={500}
        height={500}
        alt="Attachment Preview"
        placeholder="blur"
        className="mx-auto size-fit max-h-[25rem] rounded-2xl"
      />
    )
  } else if (attachmentType === "video") {
    return (
      <div>
        <video
          src={attachmentUrl}
          controls
          className="mx-auto size-fit max-h-[25rem] rounded-2xl"
        />
      </div>
    )
  } else {
    return (
      <p className="font-semibold text-destructive">Unsupported Media Type</p>
    )
  }
}

export function PostAttachments({
  attachments,
}: {
  attachments: PostAttachment[]
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((a) => (
        <PostAttachmentPreview
          key={a.attachmentUrl}
          attachmentType={a.attachmentType}
          attachmentUrl={a.attachmentUrl}
        />
      ))}
    </div>
  )
}
