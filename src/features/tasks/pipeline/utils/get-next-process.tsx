import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

import { PIPELINE_PROCESS_ORDER } from "./process-columns"
import { getTaskProcesses } from "./get-task-process"

export function getNextIncludedProcess(
  task: Task,
  processCode: ProcessCode,
): ProcessCode | null {

  const route = getTaskProcesses(task)

  const currentIndex =
    PIPELINE_PROCESS_ORDER.indexOf(processCode)

  for (
    let i = currentIndex + 1;
    i < PIPELINE_PROCESS_ORDER.length;
    i++
  ) {

    const candidate = PIPELINE_PROCESS_ORDER[i]

    if (route.includes(candidate)) {
      return candidate
    }

  }

  return null

}