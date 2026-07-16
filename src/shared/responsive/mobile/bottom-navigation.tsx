"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/shared/utils/utils"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { BOTTOM_NAV_ITEMS } from "@/shared/responsive/navigation/bottom-nav-items"

export function BottomNavigation() {
  const pathname = usePathname()
  const openDrawer = useMobileNavStore((s) => s.openDrawer)

  return (
    <nav className="flex h-14 shrink-0 items-stretch bg-[#050505]">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive =
          item.action.type === "link" &&
          pathname.startsWith(item.matchPrefix)

        const Icon = item.icon

        const content = (
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition",
              isActive ? "text-white" : "text-neutral-500",
            )}
          >
            <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
            {item.label}
          </div>
        )

        // Acción para abrir el Sidebar (Drawer)
        if (item.action.type === "sidebar") {
          return (
            <button
              key={item.label}
              type="button"
              onClick={openDrawer}
              className="flex flex-1"
              aria-label={item.label}
            >
              {content}
            </button>
          )
        }

        // Acción para navegar
        return (
          <Link
            key={item.label}
            href={item.action.href}
            className="flex flex-1"
            aria-label={item.label}
          >
            {content}
          </Link>
        )
      })}
    </nav>
  )
}