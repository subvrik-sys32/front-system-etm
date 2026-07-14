"use client"

import { Eye } from "lucide-react"

import { useSidebarStore } from "@/shared/stores/sidebar-store"

export const CLOSED_RAIL_WIDTH = 52

export function SidebarShowButton() {

  const mode = useSidebarStore(state => state.mode)
  const toggleClosed = useSidebarStore(state => state.toggleClosed)

  if (mode !== "closed") return null

  return (

    <button
      onClick={toggleClosed}
      title="Mostrar barra lateral"
      className="fixed left-3 top-5 z-40 flex h-9 w-9 items-center justify-center rounded-lg bg-[#101012] text-neutral-500 ring-1 ring-white/5 transition-colors hover:bg-white/5 hover:text-white"
    >
      <Eye size={16} />
    </button>

  )

}