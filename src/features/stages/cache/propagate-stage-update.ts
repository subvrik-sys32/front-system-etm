import type { QueryClient } from "@tanstack/react-query"

import type { Stage } from "../types/stage.types"
import {
  mapProjectCaches,
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

export function propagateStageUpdate(
  queryClient: QueryClient,
  stage: Stage,
) {
  queryClient.setQueryData<Stage>(["stage", stage.id], prev =>
    prev ? { ...prev, ...stage } : stage,
  )
  patchEntityLists(queryClient, "stages", stage.id, stage)

  mapProjectCaches(queryClient, project =>
    project.stage?.id === stage.id
      ? { ...project, stage: { ...project.stage, ...stage } }
      : project,
  )

  mapTaskCaches(queryClient, task => {
    if (task.project?.stage?.id !== stage.id) return task
    return {
      ...task,
      project: {
        ...task.project,
        stage: { ...task.project.stage, ...stage },
      },
    }
  })
}
