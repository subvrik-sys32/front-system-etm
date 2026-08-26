/**
 * Workflow stepper — tokens semánticos (CSS vars).
 * COLOR = estado del proceso; operadores siempre neutros.
 * No hardcodear hex en UI: solo var(--workflow-*).
 */
export type WorkflowStepVisual = "completed" | "current" | "pending"

export function resolveWorkflowStepVisual(opts: {
  isDone: boolean
  isCurrent: boolean
}): WorkflowStepVisual {
  if (opts.isDone) return "completed"
  if (opts.isCurrent) return "current"
  return "pending"
}

/** Estilos inline vía CSS variables del tema (light/dark). */
export const workflowStepperStyles = {
  surface: { backgroundColor: "var(--workflow-surface)" } as const,

  node: {
    completed: { backgroundColor: "var(--workflow-completed-node)" },
    current: { backgroundColor: "var(--workflow-current-node)" },
    pending: { backgroundColor: "var(--workflow-pending-node)" },
  } as const,

  icon: {
    completed: { color: "var(--workflow-completed-icon)" },
    current: { color: "var(--workflow-current-icon)" },
    pending: { color: "var(--workflow-pending-icon)" },
  } as const,

  label: {
    completed: { color: "var(--workflow-completed-label)" },
    current: { color: "var(--workflow-current-label)" },
    pending: { color: "var(--workflow-pending-label)" },
  } as const,

  connector: {
    completed: { backgroundColor: "var(--workflow-completed-connector)" },
    pending: { backgroundColor: "var(--workflow-pending-connector)" },
  } as const,

  progressTrack: { backgroundColor: "var(--workflow-progress-track)" } as const,
  progressFill: { backgroundColor: "var(--workflow-progress-fill)" } as const,

  operator: {
    backgroundColor: "var(--workflow-operator-bg)",
    color: "var(--workflow-operator-text)",
    border: "1px solid var(--workflow-operator-border)",
  } as const,
} as const
