"use client"
import { deleteComment } from "@/app/(main)/_components/comments/action-components/delete-comment-action"
import { useToast } from "@/components/ui/use-toast"
import { CommentsPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

export function useCommentDeleteMutation() {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryFilter: QueryFilters = {
        queryKey: ["comments"],
      }

      await queryClient.cancelQueries()

      queryClient.setQueriesData<InfiniteData<CommentsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              data: page.data.filter((p) => p.id !== deletedComment.id),
            })),
          }
        },
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["post-comment-info"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["comment-reply-info-query"],
        }),
      ])

      toast({
        description: "Post deleted",
      })
    },
    onError: (error) => {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Something went wrong while deleting the comment",
      })
    },
  })

  return mutation
}
