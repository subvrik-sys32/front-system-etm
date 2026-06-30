import type {
  Task,
  ProcessCode,
} from "@/features/tasks/types/task.types"

import type {
  WorkflowStep,
} from "@/features/workflow/types/workflow.types"

export interface ProcessTask{

  task:Task

  workflowStep:WorkflowStep|null

  paintStep:WorkflowStep|null

  inputQuantity:number|null

}

export type ProcessDefinition={

  code:ProcessCode

  label:string

}