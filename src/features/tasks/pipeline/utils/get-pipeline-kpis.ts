import type { Task } from "@/features/tasks/types/task.types"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

export type PipelineKpis = {
  totalTasks: number
  totalPieces: number
  inProgressCount: number
  completedCount: number
  urgentCount: number
  progressPercent: number
}

export function getPipelineKpis(
  tasks: Task[],
): PipelineKpis {

  const totalTasks = tasks.length

  const totalPieces = tasks.reduce(
    (sum, task) =>
      sum + task.pieces,
    0,
  )

  const completed = tasks.filter(
    task =>
      isWorkflowCompleted(
        task.workflowSteps,
      ),
  )

  const inProgress = tasks.filter(
    task =>
      !isWorkflowCompleted(
        task.workflowSteps,
      ),
  )

  const urgent = tasks.filter(
    task =>
      task.priority.code === "URGENTE",
  )

  const progressPercent =
    totalTasks === 0
      ? 0
      : Math.round(
          (completed.length / totalTasks) * 100,
        )

  return {
    totalTasks,
    totalPieces,
    inProgressCount: inProgress.length,
    completedCount: completed.length,
    urgentCount: urgent.length,
    progressPercent,
  }

}