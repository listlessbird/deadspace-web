"use client"
import { useCommentDeleteMutation } from "@/app/(main)/_components/comments/action-components/delete-comment-mutation"
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
import { CommentType, PostType } from "@/types"
import { ComponentProps, useCallback } from "react"

export function DeleteCommentDialog({
  comment,
  onClose,
  open,
  ...props
}: {
  comment: CommentType
  onClose: () => void
  open: boolean
} & ComponentProps<typeof Dialog>) {
  const mutation = useCommentDeleteMutation()

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
          <DialogTitle>Delete this comment?</DialogTitle>
          <DialogDescription>
            Are you sure? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant={"destructive"}
            onClick={() => mutation.mutate(comment.id, { onSuccess: onClose })}
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
