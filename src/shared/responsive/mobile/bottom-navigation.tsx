"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"

import { cn } from "@/shared/utils/utils"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { BOTTOM_NAV_ITEMS } from "@/shared/responsive/navigation/bottom-nav-items"

export function BottomNavigation() {
  const pathname = usePathname()
  const openDrawer = useMobileNavStore((s) => s.openDrawer)

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3">
      <nav className="flex items-stretch gap-1 rounded-full bg-white/8 px-1.5 py-1.5 shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-xl">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            item.action.type === "link" &&
            (Array.isArray(item.matchPrefix)
              ? item.matchPrefix.some((prefix) => pathname.startsWith(prefix))
              : pathname.startsWith(item.matchPrefix))

          const Icon = item.icon

          const content = (
            <div className="relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold">
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-chip"
                  className="absolute inset-0 rounded-full bg-white/12"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex flex-col items-center gap-0.5 transition-colors duration-150",
                  isActive ? "text-white" : "text-neutral-500"
                )}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                {item.label}
              </span>
            </div>
          )

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
    </div>
  )
}