import kyInstance from "@/lib/ky"
import { NotificationsInfo } from "@/types"
import { useQuery } from "@tanstack/react-query"

export function useNotificationsInfo(initialState: NotificationsInfo) {
  const q = useQuery({
    queryKey: ["notifications-info"],
    queryFn: () =>
      kyInstance.get(`/api/notifications/unread`).json<NotificationsInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  })

  return q
}
