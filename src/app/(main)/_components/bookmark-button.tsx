import {
  bookmarkPostAction,
  removeBookmarkAction,
} from "@/app/(main)/feed-actions/post-bookmark-action"
import { usePostBookmarkInfo } from "@/app/(main)/hooks/use-post-bookmarks-info"
import { Button } from "@/components/ui/button"
import { MotionNumber } from "@/components/ui/motion-number"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { BookmarkData } from "@/types"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, Variants } from "framer-motion"
import { BookmarkIcon } from "lucide-react"
import { useMemo } from "react"

const MotionBookMark = motion(BookmarkIcon)

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

export function PostBookmarkButton({
  postId,
  initialState,
}: {
  postId: string
  initialState: BookmarkData
}) {
  const { toast } = useToast()

  const { data } = usePostBookmarkInfo(postId, initialState)

  const queryKey: QueryKey = useMemo(
    () => ["post-bookmark-info", postId],
    [postId],
  )

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationKey: ["post-bookmark", postId],
    mutationFn: () => {
      return data.isBookMarked
        ? removeBookmarkAction(postId)
        : bookmarkPostAction(postId)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousState = queryClient.getQueryData<BookmarkData>(queryKey)

      queryClient.setQueryData<BookmarkData>(queryKey, () => ({
        bookMarkCount:
          (previousState?.bookMarkCount || 0) +
          (previousState?.isBookMarked ? -1 : 1),
        isBookMarked: !previousState?.isBookMarked,
      }))

      return { previousState }
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData<BookmarkData>(queryKey, ctx?.previousState)
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
        <MotionBookMark
          // className={cn("size-5", data.isLiked && "fill-red-600 text-red-600")}
          className="size-5 border-none outline-none"
          variants={variants}
          custom={data.isBookMarked}
          animate="animate"
          whileHover="hover"
          whileTap="hover"
        />
        {/* <span className="text-sm tabular-nums">{data.likeCount}</span> */}
        <MotionNumber value={data.bookMarkCount} className="text-sm" />
      </motion.button>
    </Button>
  )
}
