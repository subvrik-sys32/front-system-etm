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
      {/* 
        Mantenemos el bloque reservado en el DOM para conservar la misma posición en Y,
        pero lo ocultamos visualmente con opacidad cuando está en rail.
      */}
      <div
        aria-hidden={isRail}
        className={cn(
          "mb-1.5 flex h-3.5 items-center transition-opacity duration-200",
          isDrawer ? "px-3" : "px-2.5",
          isRail && "opacity-0 pointer-events-none select-none"
        )}
      >
        <span className="block max-w-full overflow-hidden truncate whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
          {title}
        </span>
      </div>
      
      {/* Espacio vertical aumentado a space-y-1.5 para que las burbujas no colisionen */}
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}