import { submitPost } from "@/app/(main)/_components/posts/editor/action"
import { createCommentAction } from "@/app/(main)/feed-actions/comment-actions"
import { useSession } from "@/app/(main)/hooks/use-session"
import { useToast } from "@/components/ui/use-toast"
import { CommentsPage, PostPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

export function useOnCommentSubmit(postId: string) {
  const { toast } = useToast()

  const { user } = useSession()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createCommentAction,
    onSuccess: async (newComment) => {
      const qKey: QueryKey = ["comments", postId]

      await queryClient.cancelQueries({ queryKey: qKey })
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        qKey,
        (oldData) => {
          const firstPage = oldData?.pages[0]

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  nextCursor: firstPage.nextCursor,
                  data: [newComment, ...firstPage.data],
                },
                ...oldData.pages.slice(1),
              ],
            }
          }
        },
      )

      //   queryClient.invalidateQueries({
      //     queryKey: qKey,
      //     predicate(query) {
      //       return !query.state
      //     },
      //   })

      queryClient.invalidateQueries({ queryKey: ["post-comment-info", postId] })

      toast({
        description: "Comment created",
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
