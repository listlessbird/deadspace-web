"use server"

import { validateRequest } from "@/auth"
import { createPostSchema } from "@/lib/validations"
import { createPost } from "@/schema/db-fns"
import { PostPage } from "@/types"

import { revalidatePath } from "next/cache"

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
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }

  // revalidatePath("/")

  return data as PostPage["data"][0]
}
