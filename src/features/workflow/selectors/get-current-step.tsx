import type { WorkflowStep } from "../types/workflow.types"

/**
 * Paso actual de la ruta: donde está trabajando la tarea ahora.
 * Prioridad: PROGRESS → PAUSED → PENDING → COMPLETED (en revisión).
 * No el primer COMPLETED de la ruta (eso marcaba el paso anterior).
 */
export function getCurrentStep(workflow: WorkflowStep[]) {
  return (
    workflow.find(s => s.status === "PROGRESS") ??
    workflow.find(s => s.status === "PAUSED") ??
    workflow.find(s => s.status === "PENDING") ??
    workflow.find(s => s.status === "COMPLETED") ??
    null
  )
}
