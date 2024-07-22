import { PostEditor } from "@/app/(main)/_components/posts/editor/post-editor"
import { Post } from "@/app/(main)/_components/posts/post"
import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { validateRequest } from "@/auth"
import { db } from "@/db"
import { schema } from "@/schema"
import { getPostsByUser } from "@/schema/db-fns"
import { sql } from "drizzle-orm"
import Image from "next/image"

export default async function Home() {
  const { user } = await validateRequest()

  if (!user) return null

  const posts = await getPostsByUser(user?.id)

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        {posts.map((post, idx) => (
          <Post key={post.id} post={post} />
        ))}
        {/* <pre className="text-black">
          <code>{JSON.stringify(posts, null, 2)}</code>
        </pre> */}
      </div>
      <TrendingSidebar />
    </main>
  )
}
