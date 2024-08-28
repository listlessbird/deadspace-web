"use server"

import { validateRequest } from "@/auth"
import { createPostSchema } from "@/lib/validations"
import { createPost } from "@/schema/db-fns"
import { PostPage } from "@/types"

export async function submitPost(content: {
  content: string
  attachmentIds: string[]
}) {
  const { user } = await validateRequest()

  if (!user) throw Error("Unauthorized")

  const { content: parsedContent, attachmentIds } =
    createPostSchema.parse(content)

  // const newPost = await db.execute(
  //   sql`insert into ${schema.postTable} (content,user_id) values (${parsedContent}, ${user.id})`,
  // )

  // const newPost = await db
  //   .insert(schema.postTable)
  //   .values({
  //     userId: user.id,
  //     content: parsedContent,
  //   })
  //   .returning()

  const newPost = await createPost({
    userId: user.id,
    content: parsedContent,
    attachmentIds,
  })

  const data = {
    ...newPost,
    username: user.username,
    displayName: user.displayName as string | null,
    avatarUrl: user.avatarUrl as string | null,
    bookmarks: { bookMarkCount: 0, isBookMarked: false },
    comments: { commentCount: 0 },
    likes: { likeCount: 0, isLiked: false },
    attachments: (newPost.attachments ?? []).map((attachment) => ({
      attachmentType: attachment.attachmentType as "video" | "image",
      attachmentUrl: attachment.attachmentUrl as string,
      ...(attachment.blurhash ? { blurhash: attachment.blurhash } : {}),
    })),
  } satisfies PostPage["data"][0]

  // revalidatePath("/")

  return data
}
