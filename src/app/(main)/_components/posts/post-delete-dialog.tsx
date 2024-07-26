"use client"
import { usePostDeleteMutation } from "@/app/(main)/_components/posts/mutations"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import { PostType } from "@/types"
import { ComponentProps, useCallback } from "react"

export function DeletePostDialog({
  post,
  onClose,
  open,
  ...props
}: {
  post: PostType
  onClose: () => void
  open: boolean
} & ComponentProps<typeof Dialog>) {
  const mutation = usePostDeleteMutation()

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open || !mutation.isPending) {
        onClose()
      }
    },
    [mutation.isPending, onClose],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post?</DialogTitle>
          <DialogDescription>
            Are you sure? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant={"destructive"}
            onClick={() => mutation.mutate(post.id, { onSuccess: onClose })}
            loading={mutation.isPending}
          >
            Delete
          </LoadingButton>
          <Button
            variant={"outline"}
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
