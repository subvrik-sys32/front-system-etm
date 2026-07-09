"use client"

import { useEffect, useRef, useState } from "react"

import { ProfileDialog } from "@/features/profile"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { cn } from "@/shared/utils/utils"

import { useSidebarCounts } from "./hooks/use-sidebar-counts"
import { useSidebarPrefetch } from "./hooks/use-sidebar-prefetch"
import { useProfilePanel } from "./hooks/use-profile-panel"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarProfile } from "./sidebar-profile"

export function AppSidebar() {

  const mode = useSidebarStore(s => s.mode)
  const lastVisibleMode = useSidebarStore(s => s.lastVisibleMode)
  const close = useSidebarStore(s => s.close)

  const [profileEditOpen, setProfileEditOpen] = useState(false)

  const asideRef = useRef<HTMLElement | null>(null)
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null)

  const clearLeaveTimeout = () => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current)
      leaveTimeout.current = null
    }
  }

  const {
    projectsCount,
    activeTasksCount,
    processCounts,
  } = useSidebarCounts()

  useSidebarPrefetch()

  const {
    profileOpen,
    setProfileOpen,
    toggleProfile,
    canOpenProfile,
    presenceCollapsed,
    presenceRef,
    panelHeight,
    containerRef,
    panelRef,
    contentRef,
    cardRef,
  } = useProfilePanel()

  const previewGeometry =
    mode === "preview" ||
    (mode === "closed" && lastVisibleMode === "preview")

  // Watcher global: no depende de mouseenter/mouseleave del aside.
  // Verifica en cada movimiento del mouse, en TODO el documento,
  // si el cursor sigue dentro del rect real del aside O dentro de
  // algún contenido "hijo lógico" del sidebar que viva en un portal
  // (popovers de Radix como el de Notificaciones), que NO forma parte
  // del rect del aside pero visualmente sí es parte del sidebar.
  useEffect(() => {

    if (mode !== "preview") {
      return
    }

    const handlePointerMove = (e: PointerEvent) => {

      const el = asideRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()

      const insideAside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      // Contenido en portal marcado explícitamente como parte del
      // sidebar (ej: PopoverContent de Notificaciones con
      // data-sidebar-popover). elementFromPoint funciona aunque el
      // elemento esté fuera del DOM del <aside>.
      const target = document.elementFromPoint(e.clientX, e.clientY)
      const insidePortalContent =
        target?.closest("[data-sidebar-popover]") != null

      const inside = insideAside || insidePortalContent

      if (inside) {
        clearLeaveTimeout()
        return
      }

      if (!leaveTimeout.current) {
        leaveTimeout.current = setTimeout(() => {
          if (useSidebarStore.getState().mode === "preview") {
            close()
          }
          leaveTimeout.current = null
        }, 200)
      }

    }

    document.addEventListener("pointermove", handlePointerMove)

    return () => {
      document.removeEventListener("pointermove", handlePointerMove)
      clearLeaveTimeout()
    }

  }, [mode, close])

  return (
    <>
      <aside
        ref={asideRef}
        className={cn(
          "isolate z-40 flex w-62 flex-col overflow-hidden bg-[#0A0A0A] ring-1 ring-white/5 will-change-transform transform-gpu transition-all duration-200 ease-out select-none",
          previewGeometry
            ? "fixed left-0 top-5 h-[calc(100vh-40px)] rounded-r-2xl border border-white/5 shadow-[0_2px_8px_rgba(0,0,0,.08),0_12px_32px_rgba(0,0,0,.12)]"
            : "fixed left-0 top-0 h-screen border-r border-white/5",
          mode === "closed" ? "translate-x-[-110%]" : "translate-x-0",
        )}
      >

        <SidebarHeader />

        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarNavigation
            projectsCount={projectsCount}
            activeTasksCount={activeTasksCount}
            processCounts={processCounts}
            presenceCollapsed={presenceCollapsed}
            presenceRef={presenceRef}
          />
        </div>

        <div className="shrink-0 select-none p-3 pt-0">
          <SidebarProfile
            onEditProfile={() => setProfileEditOpen(true)}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            toggleProfile={toggleProfile}
            canOpenProfile={canOpenProfile}
            panelHeight={panelHeight}
            containerRef={containerRef}
            panelRef={panelRef}
            contentRef={contentRef}
            cardRef={cardRef}
          />
        </div>

      </aside>

      <ProfileDialog
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
      />
    </>
  )
}