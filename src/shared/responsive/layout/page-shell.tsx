"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"
import { useChromeInset } from "@/shared/responsive/layout/use-chrome-inset"

type Props = {
  children: ReactNode
  className?: string
  /**
   * fill  — listas / páginas con chrome inset (top+bottom).
   * list  — inset lo aplica AppListScroll.
   * bleed — CAD / full-bleed: el shell no reserva top.
   *         Mobile immersive: CompactShell ya recorta con top: TOP_BAR.
   *         Desktop: el panel (CadAiPanel) aplica el inset de contenido;
   *         el fondo decorativo puede ir bajo el topbar.
   */
  mode?: "fill" | "list" | "bleed"
}

/**
 * Contenedor de página. TopBar es overlay en AppShell.
 * No mezclar paddingTop aquí con h-full en hijos: el inset de CAD
 * vive en el panel, no en el shell.
 */
export function PageShell({
  children,
  className,
  mode = "list",
}: Props) {
  const insetFill = useChromeInset({ bottom: true })

  return (
    <main
      className={cn(
        "flex h-full min-h-0 flex-col bg-background text-foreground select-none",
        mode === "list" && "px-3 pt-0 pb-2 tablet:px-4 desktop:px-5 desktop:pb-3",
        mode === "fill" && "overflow-hidden px-3 pb-2 tablet:px-4 desktop:px-5 desktop:pb-3",
        mode === "bleed" && "overflow-hidden px-0",
        className,
      )}
      style={mode === "fill" ? insetFill : undefined}
    >
      {children}
    </main>
  )
}
