import type { QueryClient } from "@tanstack/react-query"

import type { Color } from "../types/color.types"
import {
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

export function propagateColorUpdate(
  queryClient: QueryClient,
  color: Color,
) {
  queryClient.setQueryData<Color>(["color", color.id], prev =>
    prev ? { ...prev, ...color } : color,
  )
  patchEntityLists(queryClient, "colors", color.id, color)

  mapTaskCaches(queryClient, task =>
    task.color?.id === color.id
      ? { ...task, color: { ...task.color, ...color } }
      : task,
  )
}
