import type { Task } from "@/features/tasks/types/task.types"
import type { ProcessCode } from "@/features/tasks/types/task.types"

export function getTaskProcesses(
  task: Task,
): ProcessCode[] {

  // Mostramos la tarea en TODAS las columnas de su ruta desde
  // el inicio, para que cada operario vea con anticipación qué
  // trabajo le va a llegar, no solo cuando ya está en curso.
  if (task.route.length > 0) {

    return task.route

  }

  const processCodes =
    task.workflowSteps.map(
      step => step.processCode,
    )

  return Array.from(new Set(processCodes))

}