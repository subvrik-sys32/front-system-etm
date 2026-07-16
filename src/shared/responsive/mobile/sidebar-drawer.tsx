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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()])

  useEffect(() => {

    if (!drawerOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const previousOverscroll = document.documentElement.style.overscrollBehaviorY

    document.body.style.overflow = "hidden"
    // evita el rebote (bounce) de iOS que descubre el hueco superior
    // y desincroniza el backdrop del aside
    document.documentElement.style.overscrollBehaviorY = "none"

    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overscrollBehaviorY = previousOverscroll
    }

  }, [drawerOpen])

  useEffect(() => {

    if (!drawerOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)

  }, [drawerOpen, closeDrawer])

  return (

    <>

      <div
        role="presentation"
        onClick={closeDrawer}
        className={cn(
          // mismo overscan que el aside (-top-6 + h-[calc(100dvh+48px)])
          // para que ambos cubran exactamente la misma área en el rebote de iOS
          "fixed left-0 -top-6 h-[calc(100dvh+48px)] w-full",
          "z-30 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ease-out",
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <div role="dialog" aria-modal="true" aria-hidden={!drawerOpen}>
        <AppSidebar variant="drawer" open={drawerOpen} />
      </div>

    </>

  )

}