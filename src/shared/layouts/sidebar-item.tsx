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
}

export function SidebarItem({
  href,
  label,
  active,
  icon: Icon,
  count,
  collapsed,
}: Props) {

  return (

    <Link
      href={href}
      title={collapsed ? label : undefined}
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
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
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