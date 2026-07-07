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

      <div className="relative overflow-hidden rounded-2xl bg-linear-to-b from-white/5 to-white/2.5 px-4 py-4">

        <div className="flex flex-col items-center">

          <div className="relative flex h-18 w-18 items-center justify-center">

            <Image
              src="/icon.svg"
              alt="ETM SAC"
              fill
              priority
              draggable={false}
              className="select-none object-contain"
            />

          </div>

          <div className="mt-2 flex flex-col items-center">

            <h1 className="text-[12px] font-semibold tracking-[0.16em] text-white/90">
              COMPANY S.A.C.
            </h1>

            <p className="mt-0.5 text-[10px] tracking-[0.12em] text-neutral-500">
              ERP INDUSTRIAL
            </p>

          </div>

        </div>

        <button
          onClick={togglePinned}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >

          <PanelLeftClose
            size={15}
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