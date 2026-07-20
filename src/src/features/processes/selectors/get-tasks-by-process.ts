import type {
  ProcessCode,
  Task,
} from "@/features/tasks/types/task.types"

export function getTasksByProcess(
  tasks: Task[],
  processCode: ProcessCode
) {

  return tasks.filter(
    task =>

      task.route.includes(
        processCode
      )
  )

}