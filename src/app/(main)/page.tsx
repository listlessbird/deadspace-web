import { PostEditor } from "@/app/(main)/_components/posts/editor/post-editor"
import Image from "next/image"

export default function Home() {
  return (
    <main className="w-full">
      <div className="w-full">
        <PostEditor />
      </div>
    </main>
  )
}
