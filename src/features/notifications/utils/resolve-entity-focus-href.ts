/** Deeplink de entidad — mismo contrato que notificaciones (focus + id). */

export type EntityFocusScope = "task" | "project"

export function resolveEntityFocusHref(opts: {
  taskId?: string | null
  projectId?: string | null
  /** Fuente de verdad del asset: foto de proyecto vs de tarea. */
  scope?: EntityFocusScope
}): string | null {
  const params = new URLSearchParams()
  params.set("focus", crypto.randomUUID())

  const scope =
    opts.scope ??
    (opts.taskId ? "task" : opts.projectId ? "project" : undefined)

  if (scope === "project" && opts.projectId) {
    params.set("projectId", opts.projectId)
    return `/projects?${params.toString()}`
  }

  if (scope === "task" && opts.taskId) {
    params.set("taskId", opts.taskId)
    return `/tasks?${params.toString()}`
  }

  // Fallback por id presente
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

/** Ya estamos en el módulo origen del deeplink → no re-navegar. */
export function isAlreadyOnEntityOrigin(
  pathname: string,
  href: string | null | undefined,
): boolean {
  if (!href) return true
  const path = pathname.split("?")[0] ?? pathname
  if (href.startsWith("/tasks") && (path === "/tasks" || path.startsWith("/tasks/"))) {
    return true
  }
  if (
    href.startsWith("/projects") &&
    (path === "/projects" || path.startsWith("/projects/"))
  ) {
    return true
  }
  return false
}
