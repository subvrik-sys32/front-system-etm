import type {
  ProcessCode,
  Task,
} from "@/features/tasks/types/task.types"

import {
  getTasksByProcess,
} from "./get-tasks-by-process"

export function getProcessTaskCount(
  tasks: Task[],
  processCode: ProcessCode
) {

  return getTasksByProcess(
    tasks,
    processCode
  ).length

}