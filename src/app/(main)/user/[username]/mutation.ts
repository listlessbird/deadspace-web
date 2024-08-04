import { updateUserProfileAction } from "@/app/(main)/user/[username]/actions"
import { toast } from "@/components/ui/use-toast"
import { useUploadThing } from "@/lib/ut"
import { UpdateUserProfileType } from "@/lib/validations"
import { PostPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export function useUserProfileUpdateMutation() {
  const { startUpload: startAvatarUplaod } = useUploadThing("avatar")

  const queryClient = useQueryClient()

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileType
      avatar: File
    }) => {
      return Promise.all([
        updateUserProfileAction(values),
        avatar && startAvatarUplaod([avatar]),
      ])
    },
    async onSuccess([updatedUser, uploadResult], variables, context) {
      // update feeds using rq cache quickly to reflect changes instantly
      const newAvatarUrl = uploadResult?.at(0)?.serverData.avatarUrl

      const queryFilter: QueryFilters = {
        queryKey: ["post-feed", "infinite-posts"],
      }

      await queryClient.cancelQueries(queryFilter)

      queryClient.setQueriesData<InfiniteData<PostPage>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => {
              return {
                nextCursor: page.nextCursor,
                data: page.data.map((post) => {
                  if (post.userId === updatedUser.id) {
                    return {
                      ...post,
                      avatarUrl: newAvatarUrl
                        ? newAvatarUrl
                        : updatedUser.avatarUrl,
                    }
                  }
                  return post
                }),
              }
            }),
          }
        },
      )

      // also update the server components on success
      router.refresh()

      toast({
        description: "Profile updated successfully",
      })
    },
    onError(error) {
      console.error(error)
      toast({
        description: "Failed to update profile",
        variant: "destructive",
      })
    },
  })

  return mutation
}
