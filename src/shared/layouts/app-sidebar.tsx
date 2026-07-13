"use client"

import { useState } from "react"

import { ProfileDialog } from "@/features/profile"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { cn } from "@/shared/utils/utils"

import { useSidebarCounts } from "./hooks/use-sidebar-counts"
import { useSidebarPrefetch } from "./hooks/use-sidebar-prefetch"
import { useProfilePanel } from "./hooks/use-profile-panel"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarProfile } from "./sidebar-profile"
import { SidebarShowButton } from "./sidebar-show-button"

export function AppSidebar() {
  const mode = useSidebarStore((s) => s.mode)
  const lastVisibleMode = useSidebarStore((s) => s.lastVisibleMode)

  const visibleMode = mode === "closed" ? lastVisibleMode : mode
  const collapsed = visibleMode === "collapsed"

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

  return (
    <>
      <aside
        className={cn(
          "isolate z-40 fixed left-0 top-0 flex h-screen flex-col overflow-hidden border-r border-white/5 bg-[#0A0A0A] ring-1 ring-white/5 select-none transform-gpu transition-all duration-200 ease-out will-change-transform",
          collapsed ? "w-18" : "w-62",
          mode === "closed" ? "translate-x-[-110%]" : "translate-x-0",
        )}
      >
        <SidebarHeader collapsed={collapsed} />

        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarNavigation
            collapsed={collapsed}
            projectsCount={projectsCount}
            activeTasksCount={activeTasksCount}
            processCounts={processCounts}
            presenceCollapsed={presenceCollapsed || collapsed}
            presenceRef={presenceRef}
            prefetchOnHover={prefetchOnHover}
          />
        </div>

        <div className="shrink-0 select-none p-3 pt-0">
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
      </aside>

      <SidebarShowButton />

      <ProfileDialog open={profileEditOpen} onClose={() => setProfileEditOpen(false)} />
    </>
  )
}