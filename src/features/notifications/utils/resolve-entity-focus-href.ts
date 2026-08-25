/** Misma query que las notificaciones: focus + taskId | projectId. */
export function resolveEntityFocusHref(opts: {
  taskId?: string
  projectId?: string
}): string | null {
  const params = new URLSearchParams()
  params.set("focus", crypto.randomUUID())

  if (opts.taskId) {
    params.set("taskId", opts.taskId)
    return `/tasks?${params.toString()}`
  }

  if (opts.projectId) {
    params.set("projectId", opts.projectId)
    return `/projects?${params.toString()}`
  }

  return null
}
