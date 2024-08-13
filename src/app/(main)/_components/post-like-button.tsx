import {
  dislikePostAction,
  likePostAction,
} from "@/app/(main)/feed-actions/post-like-action"
import { usePostLikeInfo } from "@/app/(main)/hooks/use-post-like-info"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { LikeData } from "@/types"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import { HeartIcon } from "lucide-react"
import { useMemo } from "react"

export function PostLikeButton({
  postId,
  initialState,
}: {
  postId: string
  initialState: LikeData
}) {
  const { toast } = useToast()

  const { data } = usePostLikeInfo(postId, initialState)

  const queryKey: QueryKey = useMemo(() => ["post-like-info", postId], [postId])

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationKey: ["post-like", postId],
    mutationFn: () => {
      return data.isLiked ? dislikePostAction(postId) : likePostAction(postId)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousState = queryClient.getQueryData<LikeData>(queryKey)

      queryClient.setQueryData<LikeData>(queryKey, () => ({
        likeCount:
          (previousState?.likeCount || 0) + (previousState?.isLiked ? -1 : 1),
        isLiked: !previousState?.isLiked,
      }))

      return { previousState }
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData<LikeData>(queryKey, ctx?.previousState)
      console.error(_)
      toast({ variant: "destructive", description: "Something went wrong" })
    },
  })

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      onClick={() => mutate()}
      className="flex size-fit items-center gap-2 p-2"
    >
      <HeartIcon
        className={cn("size-5", data.isLiked && "fill-red-600 text-red-600")}
      />
      <span className="text-sm tabular-nums">
        {data.likeCount}{" "}
        <span className="hidden text-sm sm:inline">
          {data.likeCount > 1 ? "like" : "likes"}
        </span>
      </span>
    </Button>
  )
}
