"use client"

import { useEffect, type ReactNode } from "react"
import { FocusNavOverlay } from "@/shared/focus/focus-nav-overlay"
import { usePathname, useSearchParams } from "next/navigation"

import { AppSidebar } from "./app-sidebar"
import { SidebarShowButton } from "./sidebar/sidebar-show-button"
import { ThemeToggle } from "@/shared/theme"
import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { BREAKPOINTS } from "@/shared/responsive/breakpoints"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { usePageTitleStore } from "@/shared/responsive/navigation/page-title-store"
import { usePageActionsStore } from "@/shared/responsive/navigation/page-actions-store"
import { usePageToolbarStore } from "@/shared/responsive/navigation/page-toolbar-store"
import { isImmersiveRoute } from "@/shared/responsive/navigation/immersive-routes"
import {
  TOP_BAR_HEIGHT_PX,
  BOTTOM_NAV_HEIGHT_PX,
  DESKTOP_TOP_BAR_HEIGHT_PX,
} from "./chrome-constants"
import { TopBar } from "@/shared/responsive/mobile/top-bar"
import { useClearFocusOnNav } from "@/shared/hooks/use-clear-focus-on-nav"
import { BottomNavigation } from "../mobile/bottom-navigation"

type Props = {
  children: ReactNode
}

function DesktopTopBar() {
  const title = usePageTitleStore(s => s.title)
  const actions = usePageActionsStore(s => s.actions)
  const toolbar = usePageToolbarStore(s => s.toolbar)

  // Overlay como mobile: contenido scrollea debajo con blur.
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-14 items-center gap-2 overflow-visible px-3">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-16 backdrop-blur-xl"
        style={{
          maskImage: "linear-gradient(to bottom, black 40%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-16 bg-background/65"
        style={{
          maskImage: "linear-gradient(to bottom, black 30%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent)",
        }}
      />
      <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2">
        <SidebarShowButton />
        {/* Theme siempre en topbar (no en sidebar). */}
        <ThemeToggle variant="icon" />
        <div className="min-w-0 shrink-0">
          {title ? (
            <div
              title={title}
              className="inline-flex max-w-[10rem] items-center rounded-full bg-muted px-2.5 py-1.5 shadow-xs backdrop-blur-xl desktop:max-w-[14rem]"
            >
              <span className="truncate text-sm font-semibold text-foreground">
                {title}
              </span>
            </div>
          ) : null}
        </div>
        {toolbar ? (
          <div className="flex min-w-0 flex-1 items-center justify-end overflow-visible py-1.5">
            {toolbar}
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}
        {actions ? (
          <div className="flex shrink-0 items-center gap-1.5 overflow-visible py-1.5">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}

const CURVE_RADIUS = 28
const CURVE_ROUNDED = `${CURVE_RADIUS}px 0px 0px ${CURVE_RADIUS}px`
const CURVE_SQUARE = "0px 0px 0px 0px"
const TRANSITION_TIMING = "300ms ease-out"
const DRAWER_WIDTH_PX = 248
const PANEL_TRANSITION = "transform 280ms ease-out, border-radius 280ms ease-out"

function DesktopShell({ children }: Props) {
  const collapseIfOpen = useSidebarStore(s => s.collapseIfOpen)

  // Pantalla dividida / viewport < desktop: sidebar solo iconos.
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINTS.desktop - 1}px)`)
    const apply = () => {
      if (mq.matches) collapseIfOpen()
    }
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [collapseIfOpen])

  const visualState = useSidebarStore(state => state.visualState)
  const notifyClipTransitionEnd = useSidebarStore(
    state => state.notifyClipTransitionEnd,
  )

  // Radius en paralelo al width (moving-out), no en fase posterior.
  const borderRadius =
    visualState === "hidden" ||
    visualState === "curve-closing" ||
    visualState === "moving-out"
      ? CURVE_SQUARE
      : CURVE_ROUNDED

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.propertyName === "border-radius") {
      notifyClipTransitionEnd()
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-sidebar text-foreground select-none">
      <AppSidebar />
      <main
        onTransitionEnd={handleTransitionEnd}
        className="relative z-10 flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-background"
        style={{
          borderRadius,
          transition: `border-radius ${TRANSITION_TIMING}`,
        }}
      >
        <DesktopTopBar />
        <div
          className="absolute inset-x-0 bottom-0 flex min-h-0 min-w-0 flex-col overflow-hidden"
          style={{ top: DESKTOP_TOP_BAR_HEIGHT_PX }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}

function CompactShell({ children }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()
  const mode = useMobileNavStore(s => s.mode)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)

  const isOpen = mode === "open"
  const immersive = isImmersiveRoute(pathname)

  useEffect(() => {
    closeDrawer()
  }, [pathname, searchKey, closeDrawer])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, closeDrawer])

  return (
    <div className="relative h-dvh overflow-hidden bg-sidebar text-foreground select-none">
      <div
        className="absolute inset-y-0 left-0 z-0"
        style={{ width: DRAWER_WIDTH_PX }}
        aria-hidden={!isOpen}
      >
        <AppSidebar variant="drawer" open={isOpen} />
      </div>

      <div
        className="absolute inset-0 z-10 overflow-hidden bg-background"
        style={{
          transform: isOpen
            ? `translate3d(${DRAWER_WIDTH_PX}px, 0, 0)`
            : "translate3d(0px, 0, 0)",
          borderRadius: isOpen ? CURVE_ROUNDED : CURVE_SQUARE,
          transition: PANEL_TRANSITION,
          willChange: isOpen ? "transform" : "auto",
        }}
      >

        <ClearFocusOnNav />
        <TopBar />

        {immersive ? (
          <div
            data-immersive-slot
            className="absolute inset-x-0 z-10 overflow-hidden"
            style={{
              top: TOP_BAR_HEIGHT_PX,
              bottom: BOTTOM_NAV_HEIGHT_PX,
            }}
          >
            {children}
          </div>
        ) : (
          <div className="absolute inset-0 z-10 flex min-h-0 flex-col">
            {children}
          </div>
        )}

        <BottomNavigation />

        {isOpen && (
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-x-0 top-14 bottom-0 z-30 cursor-default"
            onClick={closeDrawer}
          />
        )}
      </div>
    </div>
  )
}

function ClearFocusOnNav() {
  useClearFocusOnNav()
  return null
}

export function AppShell({ children }: Props) {
  const { isMobile, ready } = useResponsive()

  if (!ready) {
    return <div className="h-full bg-background" />
  }

  const shell = isMobile ? (
    <CompactShell>{children}</CompactShell>
  ) : (
    <DesktopShell>{children}</DesktopShell>
  )

  return (
    <>
      {shell}
      <FocusNavOverlay />
    </>
  )
}