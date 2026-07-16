// app-shell.tsx
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

type Props = {
  children: ReactNode
}

function DesktopTopBar() {

  return (

    <div className="flex h-12 shrink-0 items-center px-3">

      <SidebarShowButton />

    </div>

  )

}

const CURVE_RADIUS = 28

const CLIP_ROUNDED = `inset(0 round ${CURVE_RADIUS}px 0px 0px ${CURVE_RADIUS}px)`
const CLIP_SQUARE = "inset(0 round 0px 0px 0px 0px)"

const TRANSITION_TIMING = "300ms cubic-bezier(.22,1,.36,1)"

type ContentTransitionProperty = "margin-left" | "transform"

function buildContentTransitionBase(
  property: ContentTransitionProperty,
) {
  return `${property} ${TRANSITION_TIMING}`
}

function buildContentTransitionWithClip(
  property: ContentTransitionProperty,
) {
  return `${buildContentTransitionBase(property)}, clip-path ${TRANSITION_TIMING}`
}

const SIDEBAR_OPEN_WIDTH = 248
const SIDEBAR_COLLAPSED_WIDTH = 72

function DesktopShell({ children }: Props) {

  const lastVisibleMode = useSidebarStore(state => state.lastVisibleMode)
  const visualState = useSidebarStore(state => state.visualState)
  const notifyContentTransitionEnd = useSidebarStore(
    state => state.notifyContentTransitionEnd,
  )
  const notifyClipTransitionEnd = useSidebarStore(
    state => state.notifyClipTransitionEnd,
  )

  const CONTENT_TRANSITION_BASE = buildContentTransitionBase("margin-left")
  const CONTENT_TRANSITION_WITH_CLIP = buildContentTransitionWithClip("margin-left")

  const clipPath =
    visualState === "hidden" || visualState === "curve-closing"
      ? CLIP_SQUARE
      : CLIP_ROUNDED

  const contentTransition =
    visualState === "curve-closing"
      ? CONTENT_TRANSITION_WITH_CLIP
      : CONTENT_TRANSITION_BASE

  const targetOffset =
    lastVisibleMode === "open"
      ? SIDEBAR_OPEN_WIDTH
      : SIDEBAR_COLLAPSED_WIDTH

  const offset =
    visualState === "visible" || visualState === "moving-in"
      ? targetOffset
      : 0

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLElement>,
  ) => {

    if (event.target !== event.currentTarget) return

    if (event.propertyName === "margin-left") {
      notifyContentTransitionEnd()
      return
    }

    // Fin de FASE 2: la curva terminó de cerrarse.
    if (event.propertyName === "clip-path") {
      notifyClipTransitionEnd()
    }

  }

  return (

    <div className="relative h-screen overflow-hidden bg-[#1d1c1c] text-white">

      <AppSidebar />

      <main
        onTransitionEnd={handleTransitionEnd}
        className="relative z-10 flex h-screen min-w-0 flex-col overflow-hidden bg-[#050505]"
        style={{
          marginLeft: offset,
          clipPath,
          transition: contentTransition,
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

const DRAWER_REVEAL_OFFSET = 248

function CompactShell({ children }: Props) {
  const visualState = useMobileNavStore(s => s.visualState)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)
  const notifyContentTransitionEnd = useMobileNavStore(s => s.notifyContentTransitionEnd)
  const notifyClipTransitionEnd = useMobileNavStore(s => s.notifyClipTransitionEnd)

  const targetOffset = DRAWER_REVEAL_OFFSET
  const offset = visualState === "visible" || visualState === "moving-in" ? targetOffset : 0

  // Mantenemos la lógica de transición, pero forzamos un orden de ejecución CSS
  const handleTransitionEnd = (event: React.TransitionEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return
    
    // IMPORTANTE: Solo escuchamos la propiedad específica para no disparar dos veces
    if (event.propertyName === "transform") {
      notifyContentTransitionEnd()
    } else if (event.propertyName === "clip-path") {
      notifyClipTransitionEnd()
    }
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-[#1d1c1c] text-white">
      <SidebarDrawer />
      <div
        onTransitionEnd={handleTransitionEnd}
        className="relative z-10 flex h-full min-h-0 flex-col bg-[#050505]"
        style={{
          transform: `translateX(${offset}px)`,
          clipPath: visualState === "hidden" || visualState === "curve-closing" ? CLIP_SQUARE : CLIP_ROUNDED,
          // La clave: transición explícita combinada para que el browser orqueste el sellado
          transition: "transform 300ms cubic-bezier(.22,1,.36,1), clip-path 300ms cubic-bezier(.22,1,.36,1)",
        }}
        onClickCapture={
          visualState !== "hidden"
            ? (event) => {
                event.preventDefault()
                event.stopPropagation()
                closeDrawer()
              }
            : undefined
        }
      >
        <TopBar />
        <main className="hide-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
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