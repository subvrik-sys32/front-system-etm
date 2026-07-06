"use client"

import Image from "next/image"

import { PanelLeftClose } from "lucide-react"

import { cn } from "@/shared/utils/utils"

import { useSidebarStore } from "@/shared/stores/sidebar-store"

export function SidebarHeader(){

  const mode=
    useSidebarStore(
      state=>state.mode,
    )

  const togglePinned=
    useSidebarStore(
      state=>state.togglePinned,
    )

  return(

    <div className="px-3 pb-3 pt-4">

      <div className="relative flex items-center rounded-xl bg-white/4 px-3 py-2.5">

        <div className="flex flex-1 flex-col items-center">

          <Image
            src="/icon.svg"
            alt="ETM SAC"
            width={140}
            height={32}
            priority
            className="block select-none"
          />

          <p className="mt-1 text-center text-xs text-neutral-500">
            COMPANY S.A.C.
          </p>

        </div>

        <button
          onClick={togglePinned}
          className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >

          <PanelLeftClose
            size={14}
            className={cn(
              "transition-transform duration-200",
              mode==="preview"
                ?"rotate-180"
                :"rotate-0",
            )}
          />

        </button>

      </div>

    </div>

  )

}