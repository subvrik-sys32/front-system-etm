"use client"

import { useEffect, useState } from "react"
import { cn } from "@/shared/utils/utils"

type Props = {
  open: boolean
  children: React.ReactNode
  className?: string
  /**
   * Si true (default), desmonta children al cerrar (tras la animación).
   * Evita que hooks pesados corran en filas colapsadas.
   */
  unmountOnExit?: boolean
}

/**
 * Collapse por grid 0fr/1fr.
 * Duración corta (150ms) para tablet/gamas bajas; respeta prefers-reduced-motion.
 */
export function CollapsibleHeightSection({
  open,
  children,
  className,
  unmountOnExit = true,
}: Props) {
  const [rendered, setRendered] = useState(open)

  useEffect(() => {
    if (open) {
      setRendered(true)
      return
    }
    if (!unmountOnExit) {
      setRendered(true)
      return
    }
    const t = window.setTimeout(() => setRendered(false), 210)
    return () => window.clearTimeout(t)
  }, [open, unmountOnExit])

  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "max-w-full transition-opacity duration-150 ease-out motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0",
            className,
          )}
        >
          {rendered ? children : null}
        </div>
      </div>
    </div>
  )
}
