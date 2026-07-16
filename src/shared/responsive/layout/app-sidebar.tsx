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

type Props = {
  variant?: "desktop" | "drawer"
  open?: boolean
}

export function AppSidebar({
  variant="desktop",
  open=false,
}:Props={}) {

  const mode = useSidebarStore(s=>s.mode)
  const lastVisibleMode = useSidebarStore(s=>s.lastVisibleMode)

  const visibleMode =
    mode==="closed"
      ? lastVisibleMode
      : mode


  const isDrawer =
    variant==="drawer"


  const collapsed =
    !isDrawer &&
    visibleMode==="collapsed"


  const isVisible =
    isDrawer
      ? open
      : mode!=="closed"


  const [profileEditOpen,setProfileEditOpen]=useState(false)


  const {
    projectsCount,
    activeTasksCount,
    processCounts,
  } = useSidebarCounts()


  const {
    prefetchOnHover,
  } = useSidebarPrefetch()


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
          "absolute left-0 top-0 h-full",
          "isolate z-40 flex flex-col bg-[#1d1c1c] select-none",
          "overflow-hidden",
          "transition-[width,transform] duration-300 ease-out",

          collapsed
            ? "w-18"
            : "w-62",

          isDrawer
            ? open
              ? "translate-x-0"
              : "-translate-x-full"
            : isVisible
              ? "translate-x-0"
              : "-translate-x-full"
        )}
      >

        <div className="pt-6 pb-6 flex h-full flex-col">

          <SidebarHeader
            collapsed={collapsed}
            isDrawer={isDrawer}
          />

          <div className="flex min-h-0 flex-1 flex-col">

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


          <div className="shrink-0 select-none p-3 pt-0">

            <SidebarProfile
              collapsed={collapsed}
              onEditProfile={()=>setProfileEditOpen(true)}
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


      <ProfileDialog
        open={profileEditOpen}
        onClose={()=>setProfileEditOpen(false)}
      />

    </>
  )
}