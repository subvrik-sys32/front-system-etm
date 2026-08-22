import type { QueryClient } from "@tanstack/react-query"

import type { Priority } from "../types/priority.types"
import {
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

export function propagatePriorityUpdate(
  queryClient: QueryClient,
  priority: Priority,
) {
  queryClient.setQueryData<Priority>(["priority", priority.id], prev =>
    prev ? { ...prev, ...priority } : priority,
  )
  patchEntityLists(queryClient, "priorities", priority.id, priority)

  mapTaskCaches(queryClient, task =>
    task.priority?.id === priority.id
      ? { ...task, priority: { ...task.priority, ...priority } }
      : task,
  )
}
