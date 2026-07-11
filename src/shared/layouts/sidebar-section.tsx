"use client"

import type { ReactNode } from "react"

type Props = {
  title: string
  children: ReactNode
  collapsed?: boolean
}

export function SidebarSection({
  title,
  children,
  collapsed,
}: Props) {

  return (

    <section className="mb-5">

      <div className="mb-2 px-3 h-4">

        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
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