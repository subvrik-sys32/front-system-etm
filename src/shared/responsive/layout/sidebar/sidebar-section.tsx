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
      {!isRail && (
        <div className={cn("mb-1.5 flex h-3.5 items-center", isDrawer ? "px-3" : "px-2.5")}>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            {title}
          </span>
        </div>
      )}
      <div className={cn("space-y-0.5", isRail && "flex flex-col items-center gap-0.5 space-y-0")}>
        {children}
      </div>
    </section>
  )
}
