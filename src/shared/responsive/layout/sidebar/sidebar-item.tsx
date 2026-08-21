"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { SidebarRow } from "../sidebar/sidebar-row"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"

type Props = {
  href: string
  label: string
  active: boolean
  icon: LucideIcon
  count?: number
  collapsed?: boolean
  isDrawer?: boolean
  onMouseEnter?: () => void
  onTouchStart?: () => void
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
  onTouchStart,
}: Props) {
  const closeDrawer = useMobileNavStore((s) => s.closeDrawer)

  const handleNavigate = () => {
    if (isDrawer) closeDrawer()
  }

  return (
    <Link
      href={href}
      title={collapsed && !isDrawer ? label : undefined}
      onClick={handleNavigate}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      className={cn(
        "w-full block outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl",
        active && "pointer-events-none"
      )}
    >
      <SidebarRow
        icon={Icon}
        label={label}
        collapsed={collapsed}
        active={active}
        count={count}
        isDrawer={isDrawer}
      />
    </Link>
  )
}