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
import Image, { StaticImageData } from "next/image"
import { useCallback, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import avatarPlacehoder from "@/assets/avatar-placeholder.png"
import { Camera } from "lucide-react"
import { CropImgDialog } from "@/components/ui/crop-img-dialog"
import Resizer from "react-image-file-resizer"

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
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>()

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
      const newAvatar = croppedAvatar
        ? new File([croppedAvatar], `avatar_${user.username}_${user.id}.webp`)
        : undefined
      mutation.mutate(
        { values: values, avatar: newAvatar },
        {
          onSuccess: () => {
            setCroppedAvatar(null)
            onOpenChange(false)
          },
        },
      )
    },
    [mutation, onOpenChange, croppedAvatar, user],
  )

  return (
    <>
      <div className="flex justify-center space-y-2 py-2">
        <AvatarInput
          src={
            croppedAvatar
              ? URL.createObjectURL(croppedAvatar)
              : user.avatarUrl || avatarPlacehoder
          }
          onCropComplete={(c) => setCroppedAvatar(c)}
        />
      </div>
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
    </>
  )
}

function AvatarInput({
  src,
  onCropComplete,
}: {
  src: string | StaticImageData
  onCropComplete: (croppedImg: Blob | null) => void
}) {
  const [imgToCrop, setImgToCrop] = useState<File>()

  const imgInputRef = useRef<HTMLInputElement>(null)

  const onImgSelectedToCrop = useCallback((image: File | undefined) => {
    if (!image) return

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "webp",
      100,
      0,
      (uri) => {
        // set to the state and pass it to the cropper
        setImgToCrop(uri as File)
      },
      "file",
    )
  }, [])

  return (
    <>
      <Input
        className="sr-only hidden"
        type="file"
        accept="image/*"
        ref={imgInputRef}
        onChange={(e) => onImgSelectedToCrop(e.target.files?.[0])}
      />
      <button
        type="button"
        className="group relative block"
        onClick={() => imgInputRef.current?.click()}
      >
        <Image
          alt="Avatar Preview"
          src={src}
          width={150}
          height={150}
          className="size-32 flex-none rounded-full object-cover"
        />
        <span className="absolute inset-x-0 bottom-[1%] m-auto flex h-1/2 w-full items-center justify-center rounded-bl-full rounded-br-full bg-black bg-opacity-30 py-2 text-white transition-colors duration-200 group-hover:bg-opacity-20">
          <Camera size={30} />
        </span>
      </button>
      {imgToCrop && (
        <CropImgDialog
          src={URL.createObjectURL(imgToCrop)}
          aspectRatio={1}
          onCropped={(cropped) => onCropComplete(cropped)}
          onClose={() => {
            setImgToCrop(undefined)
            if (imgInputRef.current) {
              // empty the val so user can change img to crop
              imgInputRef.current.value = ""
            }
          }}
        />
      )}
    </>
  )
}