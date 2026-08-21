"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"

type Props = {
  title: string
  children: ReactNode
  collapsed?: boolean
  isDrawer?: boolean
}

export function SidebarSection({
  title,
  children,
  collapsed,
  isDrawer = false,
}: Props) {
  const isRail = collapsed && !isDrawer

  return (
    <section className={cn(isDrawer ? "mb-2.5" : "mb-2")}>
      {/* Este título no tiene icono, así que no aporta al "salto" que se
          corrigió abajo: se desmonta en rail (como antes) para no dejar un
          hueco vacío entre grupos de iconos compactos. */}
      {!isRail && (
        <div className={cn("mb-1.5 flex h-3.5 items-center", isDrawer ? "px-3" : "px-2.5")}>
          <span className="block max-w-full overflow-hidden truncate whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            {title}
          </span>
        </div>
      )}
      {/* Ya no hace falta centrar (flex-col items-center): cada SidebarRow
          fija la posición de su propio icono con padding constante. */}
      <div className="space-y-0.5">{children}</div>
    </section>
  )
}