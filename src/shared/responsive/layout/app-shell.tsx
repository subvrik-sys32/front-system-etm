"use client"

import { useEffect, useState, type ReactNode } from "react"

import { AppSidebar } from "./app-sidebar"
import { SidebarShowButton } from "./sidebar-show-button"
import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { SidebarDrawer } from "@/shared/responsive/mobile/sidebar-drawer"
import { TopBar } from "@/shared/responsive/mobile/top-bar"
import { BottomNavigation } from "../mobile/bottom-navigation"
import { cn } from "@/shared/utils/utils"

type Props = {
  children: ReactNode
}

const CONTENT_CARD_CLASSES =
  "rounded-l-[28px] overflow-hidden"

function DesktopTopBar() {

  return (

    <div className="flex h-12 shrink-0 items-center px-3">

      <SidebarShowButton />

    </div>

  )

}


function DesktopShell({ children }: Props) {

  const mode = useSidebarStore(state => state.mode)

  const offset =
    mode === "open"
      ? 248
      : mode === "collapsed"
        ? 72
        : 0


  const [clipActive,setClipActive] = useState(
    mode !== "closed"
  )


  useEffect(()=>{

    if(mode === "closed") {

      setClipActive(false)

      return

    }

    setClipActive(true)

  },[mode])


  return (

    <div className="relative h-screen overflow-hidden bg-[#1d1c1c] text-white">

      <AppSidebar />


      <main
        className={cn(
          "relative z-10 flex h-screen min-w-0 flex-col bg-[#050505]",
          "overflow-hidden",
          mode !== "closed" && "rounded-l-[28px]",
        )}

        style={{

          transform:`translateX(${offset}px)`,

          clipPath:
            clipActive
              ? "inset(0 round 28px 0 0 28px)"
              : "inset(0 round 0 0 0 0)",

          transition:
            "transform 300ms ease-out, clip-path 300ms ease-out",

        }}
      >

        <DesktopTopBar />

        <div className="hide-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </div>

      </main>

    </div>
  )
}

// Ancho del sidebar del drawer
const DRAWER_REVEAL_OFFSET = 248


function CompactShell({ children }: Props) {

  const drawerOpen = useMobileNavStore(s => s.drawerOpen)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)

  const [showClip, setShowClip] = useState(false)

  useEffect(() => {

    if (drawerOpen) {
      setShowClip(true)
      return
    }

    const timeout = setTimeout(() => {
      setShowClip(false)
    }, 300)

    return () => clearTimeout(timeout)

  }, [drawerOpen])


  return (

    <div className="relative h-dvh overflow-hidden bg-[#1d1c1c] text-white">


      <SidebarDrawer />


      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 flex-col bg-[#050505]",
          "transition-transform duration-300 ease-out",

          drawerOpen &&
          "translate-x-(--drawer-offset) rounded-l-[28px] overflow-hidden",
        )}

        style={{
          ["--drawer-offset" as string]:
            `${DRAWER_REVEAL_OFFSET}px`,

          clipPath:
            showClip
              ? drawerOpen
                ? "inset(0 round 28px 0 0 28px)"
                : "inset(0 round 0px 0 0 0px)"
              : "none",

          transition:
            "transform 300ms ease-out, clip-path 300ms ease-out",
        }}

        onClickCapture={
          drawerOpen
            ? (event) => {
                event.preventDefault()
                event.stopPropagation()
                closeDrawer()
              }
            : undefined
        }
      >

        <TopBar />


        <main
          className="
            hide-scrollbar
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
          "
        >

          {children}

        </main>


        <BottomNavigation />


      </div>


    </div>

  )

}


export function AppShell({ children }: Props) {

  const { isMobile } = useResponsive()


  if (isMobile) {
    return (
      <CompactShell>
        {children}
      </CompactShell>
    )
  }


  return (
    <DesktopShell>
      {children}
    </DesktopShell>
  )

}