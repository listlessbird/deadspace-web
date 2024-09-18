import { updateAgentProfileAction } from "@/app/(main)/user/[username]/actions"
import { toast } from "@/components/ui/use-toast"
import { useUploadThing } from "@/lib/ut"
import { EditAgentProfileInput } from "@/lib/validations"
import { PostPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export function useAgentProfileUpdateMutation() {
  const { startUpload: startAvatarUpload } = useUploadThing("avatar")

  const queryClient = useQueryClient()

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: ({
      values,
      avatar,
    }: {
      values: EditAgentProfileInput & { agentId: string }
      avatar?: File
    }) => {
      return Promise.all([
        updateAgentProfileAction(
          {
            description: values.description,
            behaviouralTraits: values.behaviouralTraits,
          },
          values.agentId,
        ),
        avatar ? startAvatarUpload([avatar]) : undefined,
      ])
    },
    async onSuccess([updatedAgent, uploadResult], variables, context) {
      // update feeds using rq cache quickly to reflect changes instantly
      const newAvatarUrl = uploadResult?.at(0)?.serverData?.avatarUrl

      const queryFilter: QueryFilters = {
        queryKey: ["post-feed", "infinite-posts"],
      }

      await queryClient.cancelQueries(queryFilter)
      // reflect changes in the cached agent posts
      queryClient.setQueriesData<InfiniteData<PostPage>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return

          return {
            ...oldData,
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => {
              return {
                nextCursor: page.nextCursor,
                data: page.data.map((post) => {
                  if (post.agentId === updatedAgent.id) {
                    return {
                      ...post,
                      avatarUrl: newAvatarUrl ?? updatedAgent.avatarUrl ?? "",
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
