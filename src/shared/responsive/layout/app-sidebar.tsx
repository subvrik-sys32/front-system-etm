"use client"

import { useEffect, useState } from "react"
import { ProfileDialog } from "@/features/profile"
import { useSidebarStore, isSidebarHiddenOrMovingOut } from "@/shared/stores/sidebar-store"
import { cn } from "@/shared/utils/utils"

import { useSidebarCounts } from "./hooks/use-sidebar-counts"
import { useSidebarPrefetch } from "./hooks/use-sidebar-prefetch"
import { useProfilePanel } from "./hooks/use-profile-panel"
import { SidebarHeader } from "./sidebar/sidebar-header"
import { SidebarNavigation } from "./sidebar/sidebar-navigation"
import { SidebarProfile } from "./sidebar/sidebar-profile"

type Props = {
  variant?: "desktop" | "drawer"
  open?: boolean
}

const SIDEBAR_ASIDE_COLLAPSED_WIDTH = 64
const SIDEBAR_ASIDE_OPEN_WIDTH = 220

/**
 * Desktop: open | collapsed (rail) | closed — sin animar width (como el drawer móvil:
 * el estado cambia y listo; solo hover/selección en filas).
 * Móvil (drawer): siempre layout expandido; visibilidad la controla SidebarDrawer.
 */
export function AppSidebar({ variant = "desktop", open = false }: Props = {}) {
  const { mode, lastVisibleMode, visualState, notifyContentTransitionEnd } = useSidebarStore()

  const visibleMode = mode === "closed" ? lastVisibleMode : mode
  const isDrawer = variant === "drawer"
  const collapsed = !isDrawer && visibleMode === "collapsed"

  const isVisible = isDrawer ? open : visualState === "visible" || visualState === "moving-in"
  const isFullyHidden = !isDrawer && visualState === "hidden"
  const isHiddenOrMoving = isSidebarHiddenOrMovingOut(visualState)

  const width = isDrawer
    ? undefined
    : isHiddenOrMoving
      ? 0
      : collapsed
        ? SIDEBAR_ASIDE_COLLAPSED_WIDTH
        : SIDEBAR_ASIDE_OPEN_WIDTH

  const [profileEditOpen, setProfileEditOpen] = useState(false)

  const { projectsCount, activeTasksCount, processCounts } = useSidebarCounts()
  const { prefetchOnHover } = useSidebarPrefetch()
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

  // Sin transition de width: cerrar ciclo visualState al instante
  useEffect(() => {
    if (isDrawer) return
    if (visualState !== "moving-in" && visualState !== "moving-out") return
    const id = requestAnimationFrame(() => notifyContentTransitionEnd())
    return () => cancelAnimationFrame(id)
  }, [visualState, isDrawer, notifyContentTransitionEnd])

  return (
    <>
      <aside
        aria-hidden={isFullyHidden}
        style={{ width }}
        className={cn(
          !isDrawer && "shrink-0",
          isDrawer && "absolute left-0 top-0 h-full w-62",
          "h-full isolate z-0 flex flex-col bg-sidebar text-sidebar-foreground select-none overflow-hidden",
          (isDrawer && !isVisible) || isFullyHidden ? "pointer-events-none" : "",
        )}
      >
        <div className="flex h-full w-full flex-col overflow-hidden pt-1.5 pb-1.5">
          <SidebarHeader collapsed={collapsed} isDrawer={isDrawer} />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SidebarNavigation
              collapsed={collapsed}
              isDrawer={isDrawer}
              projectsCount={projectsCount}
              activeTasksCount={activeTasksCount}
              processCounts={processCounts}
              presenceCollapsed={presenceCollapsed || collapsed}
              presenceRef={presenceRef}
              prefetchOnHover={prefetchOnHover}
            />
          </div>

          <div className="z-20 shrink-0 select-none border-t border-border/40 p-1.5">
            <SidebarProfile
              collapsed={collapsed}
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
        </div>
      </aside>

      <ProfileDialog open={profileEditOpen} onClose={() => setProfileEditOpen(false)} />
    </>
  )
}
