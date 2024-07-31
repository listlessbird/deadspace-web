import { PostEditor } from "@/app/(main)/_components/posts/editor/post-editor"
import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { Feed } from "@/app/(main)/feed"
import { FollowingFeed } from "@/app/(main)/feed-following"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        {/* <Feed /> */}
        <Tabs defaultValue="global">
          <TabsList className="h-12 w-full gap-1 bg-card shadow-sm">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="global">
            <Feed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendingSidebar />
    </main>
  )
}
