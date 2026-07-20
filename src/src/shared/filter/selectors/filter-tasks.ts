import type {
  FilterChip,
} from "../types/filter.types"

import type {
  Task,
} from "@/features/tasks/types/task.types"

import {
  getCurrentStep,
} from "@/features/workflow/selectors/get-current-step"

import {
  isWorkflowCompleted,
} from "@/features/workflow/selectors/is-completed"

type Params={
  tasks:Task[]
  filters:FilterChip[]
}

export function filterTasks({
  tasks,
  filters,
}:Params){

  if(filters.length===0){
    return tasks
  }

  return tasks.filter(task=>

    filters.every(filter=>{

      switch(filter.field){

        case"status":{

          const step=
            getCurrentStep(task.workflowSteps)

          return step?.status===filter.value
        }

        case"stage":{

          if(
            filter.value==="FINALIZED"
          ){

            return isWorkflowCompleted(
              task.workflowSteps,
            )

          }

          const step=
            getCurrentStep(task.workflowSteps)

          return step?.processCode===filter.value
        }

        case"priority":

          return(
            task.priority.id===filter.value
          )

        case"client":

          return(
            task.project.client.id===filter.value
          )

        case"pm":

          return(
            task.project.pm.id===filter.value
          )

        default:

          return true

      }

    }),

  )

}