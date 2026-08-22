import type { QueryClient } from "@tanstack/react-query"

import type { Client } from "../types/client.types"
import {
  mapProjectCaches,
  mapTaskCaches,
  patchEntityLists,
} from "@/shared/core/entity/cache/patch-query-lists"

export function propagateClientUpdate(
  queryClient: QueryClient,
  client: Client,
) {
  queryClient.setQueryData<Client>(["client", client.id], prev =>
    prev ? { ...prev, ...client } : client,
  )
  patchEntityLists(queryClient, "clients", client.id, client)

  mapProjectCaches(queryClient, project =>
    project.client?.id === client.id
      ? { ...project, client: { ...project.client, ...client } }
      : project,
  )

  mapTaskCaches(queryClient, task => {
    if (task.project?.client?.id !== client.id) return task
    return {
      ...task,
      project: {
        ...task.project,
        client: { ...task.project.client, ...client },
      },
    }
  })
}
