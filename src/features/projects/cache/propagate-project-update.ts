import type { QueryClient } from "@tanstack/react-query"

import type { Project } from "../types/project.types"
import {
  mapProjectCaches,
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

/**
 * Proyecto editado: listas + detail + snapshot anidado en tasks.
 */
export function propagateProjectUpdate(
  queryClient: QueryClient,
  project: Project,
) {
  queryClient.setQueryData<Project>(["project", project.id], prev =>
    prev ? { ...prev, ...project } : project,
  )
  patchEntityLists(queryClient, "projects", project.id, project)

  mapProjectCaches(queryClient, p =>
    p.id === project.id ? { ...p, ...project } : p,
  )

  mapTaskCaches(queryClient, task => {
    if (task.project?.id !== project.id) return task
    // Mantener shape TaskProject (subset) + campos de presentación del project
    return {
      ...task,
      project: {
        ...task.project,
        sequence: project.sequence,
        projectCode: project.projectCode,
        name: project.name,
        deliveryDate: project.deliveryDate,
        client: project.client,
        pm: project.pm,
        stage: project.stage,
        status: project.status,
      },
    }
  })
}
