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
  return (
    <section className={cn(isDrawer ? "mb-2.5" : "mb-2")}>
      <div
        className={cn(
          "flex items-center",
          isDrawer ? "mb-1.5 px-3" : "mb-1.5 px-2.5",
          collapsed && !isDrawer && "h-0 mb-0 overflow-hidden",
        )}
      >
        {(!collapsed || isDrawer) && (
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            {title}
          </span>
        )}
      </div>

      <div className="space-y-0.5">{children}</div>
    </section>
  )
}
