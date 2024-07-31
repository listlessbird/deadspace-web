import { submitPost } from "@/app/(main)/_components/posts/editor/action"
import { useToast } from "@/components/ui/use-toast"
import { PostPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

export function useOnPostSubmit() {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed", "infinite-posts", "global"],
      }

      await queryClient.cancelQueries(queryFilter)
      queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
        queryFilter,
        (oldData) => {
          // put in the fist page
          const firstPage = oldData?.pages[0]

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  nextCursor: firstPage.nextCursor,
                  data: [newPost, ...firstPage.data],
                },
                ...oldData.pages.slice(1),
              ],
            }
          }

          return oldData
        },
      )

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate: (query) => !query.state.data,
      })

      toast({
        description: "Post created",
      })
    },
    onError: (error) => {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Something went wrong",
      })
    },
  })

  return mutation
}
