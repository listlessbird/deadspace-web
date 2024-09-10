import { getFilterCount } from "@/app/(main)/agents/actions"
import { useQuery } from "@tanstack/react-query"

type FilterInfo = {
  all: number
  createdByYou: number
}

export function useFilterCount(initialState: FilterInfo) {
  const query = useQuery({
    queryKey: ["agents-list", "infinite", "filter-count"],
    queryFn: () => getFilterCount(),
    initialData: initialState,
    staleTime: Infinity,
  })

  return query
}
