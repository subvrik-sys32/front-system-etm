import type { ExportScope } from "@/shared/export"
import type { Task } from "@/features/tasks/types/task.types"
import type { TimeTrackingRow } from "../types/reports.types"

import { filterTimeTrackingRows } from "../filters/filter-time-tracking-rows"
import { mapTaskStepToRow } from "./map-task-step-to-row"

export function buildTimeTrackingRows(tasks: Task[], scope: ExportScope): TimeTrackingRow[] {
  const rows: TimeTrackingRow[] = []

  for (const task of tasks) {
    task.workflowSteps.forEach((step, stepIndex) => {
      rows.push(mapTaskStepToRow(task, step, stepIndex))
    })
  }

  return filterTimeTrackingRows(rows, scope)
}