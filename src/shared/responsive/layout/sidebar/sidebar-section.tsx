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

  if (isDrawer) {

    return (

      <section className="mb-3.5">

        <div className="mb-1 px-3">

          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </span>

        </div>

        <div className="space-y-0.5">
          {children}
        </div>

      </section>

    )

  }

  return (

    <section className="mb-3">

      <div className={cn("mb-1 px-2.5 h-3.5")}>

        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {title}
          </span>
        )}

      </div>

      <div className="space-y-0.5">
        {children}
      </div>

    </section>

  )

}
