"use client"
import { deletePost } from "@/app/(main)/_components/posts/action"
import { useToast } from "@/components/ui/use-toast"
import { PostPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"

export function usePostDeleteMutation() {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const router = useRouter()

  const pathname = usePathname()

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed", "infinite-posts"],
      }

      await queryClient.cancelQueries()

      queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              data: page.data.filter((p) => p.id !== deletedPost.id),
            })),
          }
        },
      )

      toast({
        description: "Post deleted",
      })

      if (pathname === `/posts/${deletedPost.id}`) {
        router.push("/")
      }
    },
    onError: (error) => {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Something went wrong while deleting the post",
      })
    },
  })

  return mutation
}
