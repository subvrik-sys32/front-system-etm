import type { QueryClient } from "@tanstack/react-query"

import type { Thickness } from "../types/thickness.types"
import {
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

export function propagateThicknessUpdate(
  queryClient: QueryClient,
  thickness: Thickness,
) {
  queryClient.setQueryData<Thickness>(["thickness", thickness.id], prev =>
    prev ? { ...prev, ...thickness } : thickness,
  )
  patchEntityLists(queryClient, "thicknesses", thickness.id, thickness)

  mapTaskCaches(queryClient, task => {
    let next = task
    if (task.thickness?.id === thickness.id) {
      next = { ...next, thickness: { ...task.thickness, ...thickness } }
    }
    if (task.materialLines?.some(l => l.thickness?.id === thickness.id)) {
      next = {
        ...next,
        materialLines: task.materialLines!.map(line =>
          line.thickness?.id === thickness.id
            ? { ...line, thickness: { ...line.thickness, ...thickness } }
            : line,
        ),
      }
    }
    return next
  })
}
