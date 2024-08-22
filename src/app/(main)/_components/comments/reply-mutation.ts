import { createReplyAction } from "@/app/(main)/_components/comments/reply-action"
import { submitPost } from "@/app/(main)/_components/posts/editor/action"
import { createCommentAction } from "@/app/(main)/feed-actions/comment-actions"
import { useSession } from "@/app/(main)/hooks/useSession"
import { useToast } from "@/components/ui/use-toast"
import { CommentsPage, PostPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

export function useOnReplySubmit(postId: string, parentId: string) {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createReplyAction,
    onSuccess: async (newComment) => {
      const qKey: QueryKey = ["comments", "replies", postId, parentId]

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
      queryClient.invalidateQueries({
        queryKey: ["comment-reply-info-query", postId],
      })
      toast({
        description: "Reply created",
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
