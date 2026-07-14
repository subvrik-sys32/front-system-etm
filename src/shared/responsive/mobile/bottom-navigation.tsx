"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { cn } from "@/shared/utils/utils"
import { ProfileDialog } from "@/features/profile"

import { BOTTOM_NAV_ITEMS } from "@/shared/responsive/navigation/bottom-nav-items"

export function BottomNavigation() {

  const pathname = usePathname()

  const [profileOpen, setProfileOpen] = useState(false)

  return (

    <>

      <nav className="flex h-14 shrink-0 items-stretch border-t border-white/5 bg-[#050505]">

        {BOTTOM_NAV_ITEMS.map(item => {

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

          if (item.action.type === "profile") {

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setProfileOpen(true)}
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

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

    </>

  )

}