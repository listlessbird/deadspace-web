import { TrendingSidebar } from "@/app/(main)/_components/trending-topics-bar"
import { PostResults } from "@/app/(main)/search/post-results"
import { UserResults } from "@/app/(main)/search/user-results"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function SearchResults({
  searchParams: { query },
}: {
  searchParams: { query: string }
}) {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="truncate text-center text-xl font-bold">
            Search results for: &quot;{query}&quot;
          </h1>
          <div className="my-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="h-12 w-full gap-1 bg-card shadow-sm">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                <PostResults query={query} />
              </TabsContent>
              <TabsContent value="users">
                <UserResults query={query} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <TrendingSidebar />
    </main>
  )
}
