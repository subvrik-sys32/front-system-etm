"use client"

import Link from "next/link"
import { cn } from "@/shared/utils/utils"

type Props = {
  href: string
  label: string
  active: boolean
  icon: React.ElementType
  count?: number
  collapsed?: boolean
  // Rediseño específico del drawer mobile: filas más grandes (mejor
  // objetivo táctil), texto más grande, resaltado del activo más
  // sólido, contador simple sin píldora — inspirado en el sidebar
  // de la app de Claude. Desktop queda igual, sin cambios.
  isDrawer?: boolean
  onMouseEnter?: () => void
}

export function SidebarItem({
  href,
  label,
  active,
  icon: Icon,
  count,
  collapsed,
  isDrawer = false,
  onMouseEnter,
}: Props) {

  if (isDrawer) {

    return (

      <Link
        href={href}
        onMouseEnter={onMouseEnter}
        className={cn(
          "flex h-12 items-center gap-3 rounded-xl px-4 text-base font-medium transition-colors",
          active
            ? "bg-white/10 text-white"
            : "text-neutral-300 hover:bg-white/5 hover:text-white"
        )}
      >

        <Icon size={19} className="shrink-0" />

        <span className="min-w-0 flex-1 truncate">{label}</span>

        {count !== undefined && count > 0 && (
          <span
            className={cn(
              "shrink-0 text-sm font-semibold tabular-nums",
              active ? "text-white" : "text-neutral-500",
            )}
          >
            {count}
          </span>
        )}

      </Link>

    )

  }

  return (

    <Link
      href={href}
      title={collapsed ? label : undefined}
      onMouseEnter={onMouseEnter}
      className={cn(
        "mx-1 flex h-8 items-center rounded-md text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0" : "gap-2 px-3",
        active
          ? "bg-white/6 text-white"
          : "text-neutral-400 hover:bg-white/4 hover:text-white"
      )}
    >

      <span className="relative flex items-center justify-center">
        <Icon size={14} />

        {collapsed && count !== undefined && count > 0 && (
          <span className="absolute -right-3 -top-3 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
            {count}
          </span>
        )}
      </span>

      {!collapsed && <span>{label}</span>}

      {!collapsed && count !== undefined && (
        <span
          className={cn(
            "ml-auto flex h-6 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold",
            active ? "text-white" : "text-neutral-400"
          )}
        >
          {count}
        </span>
      )}

    </Link>

  )

}