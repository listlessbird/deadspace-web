import Image from "next/image"
import { ComponentPropsWithoutRef } from "react"
import UserAvatarPlaceHolder from "@/assets/avatar-placeholder.png"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  avatarUrl: string | null | undefined
  size?: number
} & Omit<
  ComponentPropsWithoutRef<typeof Image>,
  "src" | "alt" | "width" | "height"
>

export function UserAvatar({
  avatarUrl,
  size,
  className,
  ...props
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || UserAvatarPlaceHolder}
      alt="user avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
      {...props}
    />
  )
}
