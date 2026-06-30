"use client"

import { PanelLeftClose } from "lucide-react"

import { cn } from "@/shared/utils/utils"

import { useSidebarStore } from "@/shared/stores/sidebar-store"

export function SidebarHeader() {

  const mode =
    useSidebarStore(
      state => state.mode
    )

  const togglePinned =
    useSidebarStore(
      state => state.togglePinned
    )

  return (

    <div className="px-3 pb-3 pt-4">

      <div className="flex items-center justify-between rounded-xl bg-white/4 px-3 py-2.5">

        <div>

          <h1 className="text-sm font-semibold text-white">

            ETM SAC

          </h1>

          <p className="mt-0.5 text-xs text-neutral-500">

            Production ERP

          </p>

        </div>

        <button
          onClick={togglePinned}
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >

          <PanelLeftClose
            size={14}
            className={cn(
              "transition-transform duration-200",
              mode === "preview"
                ? "rotate-180"
                : "rotate-0"
            )}
          />

        </button>

      </div>

    </div>

  )

}