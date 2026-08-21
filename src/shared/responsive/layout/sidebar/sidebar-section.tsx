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
  const labelsVisible = !collapsed || isDrawer

  return (
    <section className={cn(isDrawer ? "mb-2.5" : "mb-2")}>
      <div
        className={cn(
          "flex h-3.5 items-center",
          isDrawer ? "mb-1.5 px-3" : "mb-1.5 pl-[72px] pr-2.5",
        )}
      >
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70 transition-opacity duration-200",
            labelsVisible ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {title}
        </span>
      </div>

      <div className="space-y-0.5">{children}</div>
    </section>
  )
}
