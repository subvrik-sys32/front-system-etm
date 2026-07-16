"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { cn } from "@/shared/utils/utils"
import { AppSidebar } from "../layout/app-sidebar"

export function SidebarDrawer() {
  const drawerOpen = useMobileNavStore(s => s.drawerOpen)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    closeDrawer()
  }, [pathname, searchParams.toString()])

  useEffect(() => {
    if (!drawerOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [drawerOpen, closeDrawer])

  return (
    <div
      className={cn(
        "fixed inset-0 z-30 transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)]",
        drawerOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!drawerOpen}
    >
      {/* Backdrop con desvanecimiento */}
      <div
        role="presentation"
        onClick={closeDrawer}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Contenedor del Sidebar que sube desde abajo */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-full transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)]",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <AppSidebar variant="drawer" open={drawerOpen} />
      </div>
    </div>
  )
}