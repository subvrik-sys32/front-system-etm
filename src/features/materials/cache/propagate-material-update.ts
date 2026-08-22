import type { QueryClient } from "@tanstack/react-query"

import type { Material } from "../types/material.types"
import {
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

export function propagateMaterialUpdate(
  queryClient: QueryClient,
  material: Material,
) {
  queryClient.setQueryData<Material>(["material", material.id], prev =>
    prev ? { ...prev, ...material } : material,
  )
  patchEntityLists(queryClient, "materials", material.id, material)

  mapTaskCaches(queryClient, task => {
    let next = task
    if (task.material?.id === material.id) {
      next = { ...next, material: { ...task.material, ...material } }
    }
    if (task.materialLines?.some(l => l.material?.id === material.id)) {
      next = {
        ...next,
        materialLines: task.materialLines!.map(line =>
          line.material?.id === material.id
            ? { ...line, material: { ...line.material, ...material } }
            : line,
        ),
      }
    }
    return next
  })
}
