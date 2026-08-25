"use client"

import { cn } from "@/shared/utils/utils"

type Props = {
  open: boolean
  children: React.ReactNode
  className?: string
  /**
   * Si true (default), no monta children al cerrar.
   * Evita hooks pesados (KPI, workflow, mensajes) en filas colapsadas.
   */
  unmountOnExit?: boolean
}

/**
 * Collapse de rows (proyectos / tareas / procesos).
 *
 * Instantáneo: un solo paso al abrir/cerrar.
 * Sin grid-template-rows ni opacity animados → sin doble micro-paso
 * ni reflow por frame en PCs lentas.
 */
export function CollapsibleHeightSection({
  open,
  children,
  className,
  unmountOnExit = true,
}: Props) {
  if (!open && unmountOnExit) return null

  return (
    <div
      className={cn(!open && "hidden", className)}
      aria-hidden={!open}
    >
      {children}
    </div>
  )
}
