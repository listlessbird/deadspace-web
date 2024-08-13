import {
  dislikePostAction,
  likePostAction,
} from "@/app/(main)/feed-actions/post-like-action"
import { usePostLikeInfo } from "@/app/(main)/hooks/use-post-like-info"
import { Button } from "@/components/ui/button"
import { MotionNumber } from "@/components/ui/motion-number"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { LikeData } from "@/types"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, Variants } from "framer-motion"
import { HeartIcon } from "lucide-react"
import { useMemo } from "react"

const MotionHeart = motion(HeartIcon)

//  animate={{
//           fill: data.isLiked ? "#dc2626" : "",
//           color: data.isLiked ? "#dc2626" : "",
//         }}
//         whileHover={{ scale: 1.1, rotate: "5deg" }}
//         whileTap={{ scale: 1.1, rotate: "5deg" }}

const variants: Variants = {
  animate: (isLiked: boolean) => ({
    fill: isLiked ? "#dc2626" : "",
    color: isLiked ? "#dc2626" : "",
  }),
  hover: {
    scale: 1.1,
    rotate: "5.5deg",
  },
}

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
      className="flex size-fit items-center gap-2 border-none p-2 outline-none"
      asChild
    >
      <motion.button

      // custom={data.isLiked}
      // variants={variants}
      >
        <MotionHeart
          // className={cn("size-5", data.isLiked && "fill-red-600 text-red-600")}
          className="size-5 border-none outline-none"
          variants={variants}
          custom={data.isLiked}
          animate="animate"
          whileHover="hover"
          whileTap="hover"
        />
        {/* <span className="text-sm tabular-nums">{data.likeCount}</span> */}
        <MotionNumber value={data.likeCount} className="text-sm" />
      </motion.button>
    </Button>
  )
}
