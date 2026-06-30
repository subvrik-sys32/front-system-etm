"use client"

import { useRef } from "react"
import { useSidebarStore } from "@/shared/stores/sidebar-store"

export function SidebarHoverZone() {

  const mode = useSidebarStore(state => state.mode)

  const preview = useSidebarStore(state => state.preview)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  if (mode !== "closed") return null

  return (

    <div
      className="fixed left-0 top-0 z-40 h-screen w-3"
      onMouseEnter={() => {

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {

          preview()

        }, 150)

      }}
    />

  )

}