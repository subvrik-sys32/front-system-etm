import type {
  ProcessTask,
} from "../types/process.types"

export const processAccess = {

  task: (item: ProcessTask) =>
    item.task,

  workflowStep: (item: ProcessTask) =>
    item.workflowStep,

  paintStep: (item: ProcessTask) =>
    item.paintStep,

  project: (item: ProcessTask) =>
    item.task.project,

  priority: (item: ProcessTask) =>
    item.task.priority,

  operator: (item: ProcessTask) =>
    item.workflowStep?.operator ?? null,

  status: (item: ProcessTask) =>
    item.workflowStep?.status,

  stepId: (item: ProcessTask) =>
    item.workflowStep?.id,

  processCode: (item: ProcessTask) =>
    item.workflowStep?.processCode,

  inputQuantity: (item: ProcessTask) =>
    item.inputQuantity,

}