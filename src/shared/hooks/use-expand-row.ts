"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { clearEntityFocusParams } from "./clear-entity-focus-params"

type Props = {
  /** Id que la URL pide enfocar (taskId / projectId). */
  focusedId?: string
  setExpandedRowId: (id: string | null) => void
}

/**
 * Toggle de usuario — mismo contrato en tareas / proyectos / procesos.
 *
 * 1. Cambia expanded en el mismo tick (paint inmediato, como procesos).
 * 2. Si hay deep-link en la URL, lo consume *después* del paint
 *    (queueMicrotask) para no retrasar el expand con router.replace.
 */
export function useExpandRow({
  focusedId,
  setExpandedRowId,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (nextId: string | null) => {
      setExpandedRowId(nextId)

      const hasFocusParams =
        searchParams.has("taskId") ||
        searchParams.has("projectId") ||
        searchParams.has("focus") ||
        searchParams.has("tab")

      if (!hasFocusParams) return

      // Diferir: el row ya pintó expandido/colapsado.
      queueMicrotask(() => {
        clearEntityFocusParams(router, pathname, searchParams)
      })
    },
    [focusedId, setExpandedRowId, router, pathname, searchParams],
  )
}
