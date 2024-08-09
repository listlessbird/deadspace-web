"use client"
import { cn } from "@/lib/utils"
import Image from "next/image"

import useNextBlurHash from "use-next-blurhash"

type PostAttachment = {
  attachmentType: string
  attachmentUrl: string
  blurhash?: string
}

function PostAttachmentPreview({
  attachmentType,
  attachmentUrl,
  blurhash,
}: PostAttachment) {
  const [blurDataUrl] = useNextBlurHash(
    blurhash || "LEHLk~WB2yk8pyo0adR*.7kCMdnj",
  )

  if (attachmentType === "image") {
    return (
      <Image
        src={attachmentUrl}
        width={500}
        height={500}
        alt="Attachment Preview"
        placeholder="blur"
        blurDataURL={blurDataUrl}
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
