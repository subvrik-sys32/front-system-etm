"use client"

import { useRef, useState } from "react"

import { ProfileDialog } from "@/features/profile"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { cn } from "@/shared/utils/utils"

import { useSidebarCounts } from "./hooks/use-sidebar-counts"
import { useSidebarPrefetch } from "./hooks/use-sidebar-prefetch"
import { useProfilePanel } from "./hooks/use-profile-panel"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarPresence } from "./sidebar-presence"
import { SidebarProfile } from "./sidebar-profile"

export function AppSidebar() {

  const mode = useSidebarStore(s => s.mode)
  const lastVisibleMode = useSidebarStore(s => s.lastVisibleMode)
  const close = useSidebarStore(s => s.close)

  const [profileEditOpen, setProfileEditOpen] = useState(false)

  const leaveTimeout = useRef<NodeJS.Timeout | null>(null)

  const { projectsCount, activeTasksCount, processCounts } = useSidebarCounts()

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

  const preview = mode === "preview"

  const previewGeometry =
    mode === "preview" ||
    (
      mode === "closed" &&
      lastVisibleMode === "preview"
    )

  return (

    <>

      <aside
        onMouseEnter={() =>
          leaveTimeout.current &&
          clearTimeout(leaveTimeout.current)
        }
        onMouseLeave={() => {

          if (!preview) {
            return
          }

          leaveTimeout.current = setTimeout(close, 200)

        }}
        className={cn(

          "isolate z-50 flex w-62 flex-col overflow-hidden bg-[#0A0A0A] ring-1 ring-white/5 will-change-transform transform-gpu transition-all duration-200 ease-out",
          previewGeometry
            ? "fixed left-0 top-5 h-[calc(100vh-40px)] rounded-r-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            : "fixed left-0 top-0 h-screen border-r border-white/5",
          mode === "closed"
            ? "translate-x-[-110%]"
            : "translate-x-0",
        )}
      >

        <SidebarHeader />

        <div className="min-h-0 flex-1 flex flex-col">

          <SidebarNavigation
            projectsCount={projectsCount}
            activeTasksCount={activeTasksCount}
            processCounts={processCounts}
          />

          <SidebarPresence
            collapsed={presenceCollapsed}
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