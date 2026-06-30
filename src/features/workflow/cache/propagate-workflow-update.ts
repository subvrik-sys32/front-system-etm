import type { QueryClient } from "@tanstack/react-query"

import type { Task } from "@/features/tasks/types/task.types"

import type { WorkflowResponse } from "../services/workflow.services"

import { replaceEntity } from "@/shared/core/entity/cache/replace-entity"
import { replaceNestedEntity } from "@/shared/core/entity/cache/replace-nested-entity"

export function propagateWorkflowUpdate(
  queryClient:QueryClient,
  response:WorkflowResponse,
){

  const task=
    response.task

  if(task){

    queryClient.setQueryData<Task[]>(

      ["tasks"],

      current=>

        replaceEntity(
          current??[],
          task,
        ),

    )

    queryClient.setQueryData<Task>(

      ["task",task.id],

      task,

    )

    return

  }

  const workflowStep=
    response.workflowStep

  if(!workflowStep){
    return
  }

  queryClient.setQueryData<Task[]>(

    ["tasks"],

    current=>{

      const tasks=

        replaceNestedEntity(

          current??[],

          task=>task.workflowSteps,

          (task,workflowSteps)=>({

            ...task,

            workflowSteps,

          }),

          workflowStep,

        )

      const parentTask=

        tasks.find(

          task=>

            task.workflowSteps.some(

              step=>

                step.id===workflowStep.id,

            ),

        )

      if(parentTask){

        queryClient.setQueryData<Task>(

          ["task",parentTask.id],

          parentTask,

        )

      }

      return tasks

    },

  )

}