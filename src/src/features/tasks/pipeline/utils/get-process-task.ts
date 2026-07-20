import { getWorkflowStep } from "@/features/workflow/selectors/get-workflow-step"
import { getProcessInput } from "@/features/workflow/selectors/get-process-input"

import { PAINT_PROCESS_CODE } from "./process-columns"

import type { ProcessTask } from "@/features/processes/types/process.types"
import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

export function getProcessTask(task: Task, processCode: ProcessCode): ProcessTask {

  const workflowStep = getWorkflowStep(task, processCode) ?? null

  const paintStep = getWorkflowStep(task, PAINT_PROCESS_CODE) ?? null

  const inputQuantity = getProcessInput(task, processCode)

  return { task, workflowStep, paintStep, inputQuantity }

}