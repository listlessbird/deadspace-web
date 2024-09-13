import { createAgentAction } from "@/app/(main)/agents/actions"
import { useToast } from "@/components/ui/use-toast"
import { AgentsPage } from "@/types"
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

export function useOnNewAgentSubmit() {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createAgentAction,
    onSuccess: async (newAgent) => {
      if ("error" in newAgent) {
        return
      }

      const queryFilter = {
        queryKey: ["agents-list", "infinite", "list"],
      } satisfies QueryFilters

      await queryClient.cancelQueries(queryFilter)
      queryClient.setQueriesData<InfiniteData<AgentsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return
          const firstPage = oldData?.pages[0]
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  nextCursor: firstPage.nextCursor,
                  agents: [newAgent, ...firstPage.agents],
                },
                ...oldData.pages.slice(1),
              ],
            }
          }

          return oldData
        },
      )

      await queryClient.invalidateQueries({
        queryKey: ["agents-list", "infinite", "filter-count"],
        predicate: (query) =>
          !query.state.data || query.queryKey.includes("filter-count"),
      })

      toast({
        description: "Agent created",
      })
    },
    onError: (error) => {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Something went wrong",
      })
    },
  })

  return mutation
}
