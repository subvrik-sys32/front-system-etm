"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"
import { useChromeInset } from "@/shared/responsive/layout/use-chrome-inset"

type Props = {
  children: ReactNode
  className?: string
  /**
   * fill = CAD, Nesting, Bitácora desktop: inset en el shell.
   * list = listas con AppListScroll: inset lo aplica el scroll.
   */
  mode?: "fill" | "list"
}

/**
 * Shell de página unificado.
 * TopBar siempre overlay con blur (AppShell).
 * mode=fill → paddingTop del chrome acá.
 * mode=list → AppListScroll es dueño del inset.
 */
export function PageShell({
  children,
  className,
  mode = "list",
}: Props) {
  const inset = useChromeInset({ bottom: mode === "fill" })

  return (
    <main
      className={cn(
        "flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none",
        "tablet:px-4 desktop:px-5 desktop:pb-3",
        mode === "fill" && "overflow-hidden",
        className,
      )}
      style={mode === "fill" ? inset : undefined}
    >
      {children}
    </main>
  )
}
