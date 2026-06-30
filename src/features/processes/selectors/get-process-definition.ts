import type {
  ProcessCode,
} from "@/features/tasks/types/task.types"

import {
  PROCESSES,
} from "../constants/processes"

export function getProcessDefinition(
  processCode: ProcessCode
) {

  return PROCESSES.find(
    process =>
      process.code === processCode
  )

}