import type { QueryClient } from "@tanstack/react-query"

import type { Project } from "@/features/projects/types/project.types"
import type { Task } from "@/features/tasks/types/task.types"

/** Parchea todas las listas cuyo queryKey empieza por `prefix`. */
export function patchEntityLists<T extends { id: string }>(
  queryClient: QueryClient,
  prefix: string,
  id: string,
  entity: T,
) {
  for (const [key, data] of queryClient.getQueriesData<T[]>({
    queryKey: [prefix],
  })) {
    if (!Array.isArray(data)) continue
    queryClient.setQueryData<T[]>(
      key,
      data.map(item => (item.id === id ? { ...item, ...entity } : item)),
    )
  }
}

export function mapProjectCaches(
  queryClient: QueryClient,
  map: (project: Project) => Project,
) {
  for (const [key, data] of queryClient.getQueriesData<Project[]>({
    queryKey: ["projects"],
  })) {
    if (!Array.isArray(data)) continue
    queryClient.setQueryData<Project[]>(key, data.map(map))
  }

  for (const [key, data] of queryClient.getQueriesData<Project>({
    queryKey: ["project"],
  })) {
    if (!data || typeof data !== "object" || !("id" in data)) continue
    queryClient.setQueryData<Project>(key, map(data))
  }
}

export function mapTaskCaches(
  queryClient: QueryClient,
  map: (task: Task) => Task,
) {
  for (const [key, data] of queryClient.getQueriesData<Task[]>({
    queryKey: ["tasks"],
  })) {
    if (!Array.isArray(data)) continue
    queryClient.setQueryData<Task[]>(key, data.map(map))
  }

  for (const [key, data] of queryClient.getQueriesData<Task>({
    queryKey: ["task"],
  })) {
    if (!data || typeof data !== "object" || !("id" in data)) continue
    queryClient.setQueryData<Task>(key, map(data))
  }
}
