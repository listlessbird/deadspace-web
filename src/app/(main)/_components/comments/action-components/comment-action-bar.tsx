import { DeleteCommentDialog } from "@/app/(main)/_components/comments/action-components/delete-comment"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CommentType, PostType } from "@/types"
import { AnimatePresence, motion } from "framer-motion"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { HTMLAttributes, useState } from "react"

export function CommentActionBar({
  comment,
  className,
  ...props
}: { comment: CommentType } & HTMLAttributes<HTMLDivElement>) {
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div>
      <Button
        size={"sm"}
        variant={"ghost"}
        className={cn("group/btn", className)}
        onClick={() => setShowDelete(true)}
      >
        <Trash2 className="size-4 text-muted-foreground group-hover/btn:text-destructive" />
        <span className="sr-only">Delete</span>
      </Button>
      <AnimatePresence initial={false}>
        <motion.div
          initial={{
            filter: "blur(10px)",
            y: -25,
          }}
          animate={{ filter: "blur(0px)", y: 0 }}
          exit={{ filter: "blur(10px)", y: -25 }}
        >
          <DeleteCommentDialog
            comment={comment}
            open={showDelete}
            onClose={() => setShowDelete(false)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
