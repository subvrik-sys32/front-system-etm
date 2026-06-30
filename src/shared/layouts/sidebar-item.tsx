"use client"

import Link from "next/link"
import { cn } from "@/shared/utils/utils"

type Props = {
  href: string
  label: string
  active: boolean
  icon: React.ElementType
  count?: number
}

export function SidebarItem({
  href,
  label,
  active,
  icon: Icon,
  count,
}: Props) {

  return (

    <Link
      href={href}
      className={cn(
        "mx-1 flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        active
          ? "bg-white/6 text-white"
          : "text-neutral-400 hover:bg-white/4 hover:text-white"
      )}
    >

      <Icon size={14} />

      <span>{label}</span>

      {count!==undefined && (

        <span
          className={cn(
            "ml-auto flex h-6 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold",
            active
              ? "text-white"
              : "text-neutral-400"
          )}
        >

          {count}

        </span>

      )}

    </Link>

  )

}