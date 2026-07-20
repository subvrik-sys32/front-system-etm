import type { QueryClient } from "@tanstack/react-query"

import type { Project } from "../types/project.types"
import type { Task } from "@/features/tasks/types/task.types"

export function propagateProjectUpdate(
  queryClient:QueryClient,
  project:Project,
){

  queryClient.setQueryData<Project>(
    ["project",project.id],
    project,
  )

  queryClient.setQueryData<Task[]>(

    ["tasks"],

    current=>

      (current??[]).map(task=>

        task.project.id!==project.id

          ?task

          :{

              ...task,

              project,

            },

      ),

  )

}