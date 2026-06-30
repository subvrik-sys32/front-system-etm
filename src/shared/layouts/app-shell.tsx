"use client"

import type {
  ReactNode,
} from "react"

import {
  AppSidebar,
} from "./app-sidebar"

import {
  SidebarHoverZone,
} from "./sidebar-hover-zone"

import {
  useSidebarStore,
} from "@/shared/stores/sidebar-store"

type Props = {
  children: ReactNode
}

export function AppShell({
  children,
}: Props) {

  const mode =
    useSidebarStore(
      state => state.mode
    )

  return (

    <div className="min-h-screen bg-[#050505] text-white">

      <SidebarHoverZone />

      <AppSidebar />

      <main
        className="min-h-screen min-w-0 overflow-x-hidden transition-[margin] duration-200 ease-out"
        style={{
          marginLeft:
            mode === "open"
              ? 248
              : 0,
        }}
      >

        {children}

      </main>

    </div>

  )

}