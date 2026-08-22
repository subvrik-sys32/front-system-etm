import type { QueryClient } from "@tanstack/react-query"

import type { Status } from "../types/status.types"
import {
  mapProjectCaches,
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

export function propagateStatusUpdate(
  queryClient: QueryClient,
  status: Status,
) {
  queryClient.setQueryData<Status>(["status", status.id], prev =>
    prev ? { ...prev, ...status } : status,
  )
  patchEntityLists(queryClient, "statuses", status.id, status)

  mapProjectCaches(queryClient, project =>
    project.status?.id === status.id
      ? { ...project, status: { ...project.status, ...status } }
      : project,
  )

  mapTaskCaches(queryClient, task => {
    if (task.project?.status?.id !== status.id) return task
    return {
      ...task,
      project: {
        ...task.project,
        status: { ...task.project.status, ...status },
      },
    }
  })
}
