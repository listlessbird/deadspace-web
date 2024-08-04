"use client"

import { useUserProfileUpdateMutation } from "@/app/(main)/user/[username]/mutation"
import { useMediaQuery } from "@/app/hooks/useMediaQuery"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { updateProfileSchema, UpdateUserProfileType } from "@/lib/validations"
import { UserViewType } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { ComponentType, useCallback } from "react"
import { useForm } from "react-hook-form"

export function EditUserProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserViewType
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={"bottom"}>
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
          </SheetHeader>
          <UserProfileEditForm
            onOpenChange={onOpenChange}
            user={user}
            renderFooter={(isLoading) => (
              <SheetFooter>
                <LoadingButton loading={isLoading} type="submit">
                  Save
                </LoadingButton>
              </SheetFooter>
            )}
          />
        </SheetContent>
      </Sheet>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <UserProfileEditForm
          onOpenChange={onOpenChange}
          user={user}
          renderFooter={(isLoading) => (
            <DialogFooter>
              <LoadingButton type="submit" loading={isLoading}>
                Save
              </LoadingButton>
            </DialogFooter>
          )}
        />
      </DialogContent>
    </Dialog>
  )
}

function UserProfileEditForm({
  user,
  renderFooter,
  onOpenChange,
}: {
  user: UserViewType
  renderFooter: (loading: boolean) => JSX.Element
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<UpdateUserProfileType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: user.displayName || user.username,
      bio: user.bio || "",
    },
  })

  const mutation = useUserProfileUpdateMutation()

  const onSubmit = useCallback(
    async (values: UpdateUserProfileType) => {
      mutation.mutate(
        { values: values },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        },
      )
    },
    [mutation],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Display Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
                  placeholder="Something about yourself"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Footer>
          <LoadingButton loading={mutation.isPending} type="submit">
            Save
          </LoadingButton>
        </Footer> */}
        {renderFooter(mutation.isPending)}
      </form>
    </Form>
  )
}
