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
 * SSOT de expand/collapse de list rows (tareas / proyectos / procesos /
 * nesting sidebar / etc.).
 *
 * Arquitectura:
 * - Un solo frame: open → monta children; !open → null (o hidden).
 * - Sin height animation, sin opacity, sin rAF, sin setTimeout.
 * - El contenido pesado (ExpandedRow) debe vivir DENTRO de este
 *   bloque cuando `open`, no detrás de un segundo estado
 *   (showPipeline) que retrasa un effect.
 *
 * showFields / sub-paneles pueden usar otra instancia anidada;
 * el row principal no debe tener "doble paso".
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
