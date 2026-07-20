import type { ProcessCode } from "@/features/tasks/types/task.types"

export const PIPELINE_PROCESS_ORDER: ProcessCode[] = [
  "CT",
  "PL",
  "SD",
  "PT",
  "EN",
  "DS",
]

export const PAINT_PROCESS_CODE: ProcessCode = "PT"

export const PIPELINE_KPI_COLORS = {
  tasks: "#afafaf",
  pieces: "#a6c7d4",
  urgent: "#EF4444",
  progress: "#22C55E",
} as const