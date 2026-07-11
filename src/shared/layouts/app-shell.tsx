"use client"

import type { ReactNode } from "react"

import { AppSidebar } from "./app-sidebar"
import { SidebarShowButton, CLOSED_RAIL_WIDTH } from "./sidebar-show-button"
import { useSidebarStore } from "@/shared/stores/sidebar-store"

type Props = {
  children: ReactNode
}

export function AppShell({ children }: Props) {

  const mode = useSidebarStore(state => state.mode)

  const marginLeft =
    mode === "open"
      ? 248
      : mode === "collapsed"
        ? 72
        : CLOSED_RAIL_WIDTH

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      <AppSidebar />

      <SidebarShowButton />

      <main
        className="min-h-screen min-w-0 overflow-x-hidden transition-[margin] duration-200 ease-out"
        style={{
          marginLeft,
        }}
      >
        {children}
      </main>

    </div>
  )
}