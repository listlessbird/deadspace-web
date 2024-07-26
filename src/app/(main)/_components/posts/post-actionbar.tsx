import { DeletePostDialog } from "@/app/(main)/_components/posts/post-delete-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PostType } from "@/types"
import { AnimatePresence, motion } from "framer-motion"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { HTMLAttributes, useState } from "react"

export function PostActionBar({
  post,
  className,
  ...props
}: { post: PostType } & HTMLAttributes<HTMLDivElement>) {
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant={"ghost"} className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDelete(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AnimatePresence initial={false}>
        <motion.div
          initial={{
            filter: "blur(10px)",
            y: -25,
          }}
          animate={{ filter: "blur(0px)", y: 0 }}
          exit={{ filter: "blur(10px)", y: -25 }}
        >
          <DeletePostDialog
            post={post}
            open={showDelete}
            onClose={() => setShowDelete(false)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
