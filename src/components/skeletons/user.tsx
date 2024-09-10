import { Skeleton } from "@/components/ui/skeleton"

export default function UsersSkelton() {
  return (
    <div className="space-y-5">
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
    </div>
  )
}

function UserSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-3 rounded-2xl bg-card px-5 py-3 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
      <Skeleton className="h-5 rounded" />
    </div>
  )
}
