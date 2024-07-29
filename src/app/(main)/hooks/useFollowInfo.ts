import kyInstance from "@/lib/ky"
import { FollowerData } from "@/types"
import { useQuery } from "@tanstack/react-query"

export function useFollowerInfo(userId: string, initialState: FollowerData) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/follows`).json<FollowerData>(),
    // gets from the server
    initialData: initialState,
    // dont auto revalidate as this will trigger a lot of reqs since this hook is used inside a component with a lot of usage
    staleTime: Infinity,
  })

  return query
}
