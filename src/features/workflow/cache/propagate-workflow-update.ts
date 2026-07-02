import type { QueryClient } from "@tanstack/react-query"

import type { Task } from "@/features/tasks/types/task.types"

import type { WorkflowResponse } from "../services/workflow.services"

export function propagateWorkflowUpdate(
  queryClient:QueryClient,
  response:WorkflowResponse,
){

  const{ taskId,workflowSteps }=
    response

  queryClient.setQueryData<Task[]>(

    ["tasks"],

    current=>{

      if(!current)return current

      return current.map(task=>

        task.id===taskId

          ?{
              ...task,
              workflowSteps,
            }

          :task,

      )

    },

  )

  const cachedTask=
    queryClient.getQueryData<Task>(
      ["task",taskId],
    )

  if(cachedTask){

    queryClient.setQueryData<Task>(

      ["task",taskId],

      {
        ...cachedTask,
        workflowSteps,
      },

    )

  }

}