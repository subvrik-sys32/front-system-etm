"use client"

import Image from "next/image"

import { PanelLeftClose, X } from "lucide-react"

import { useSidebarStore } from "@/shared/stores/sidebar-store"

type Props = {
  collapsed: boolean
}

const HEADER_BOX_HEIGHT = 150

export function SidebarHeader({ collapsed }: Props) {

  const toggleCollapsed = useSidebarStore(state => state.toggleCollapsed)
  const toggleClosed = useSidebarStore(state => state.toggleClosed)

  return (

    <div className="px-3 pb-3 pt-4">

      <div
        className="relative flex items-center justify-center"
        style={{ height: HEADER_BOX_HEIGHT }}
      >

        {collapsed ? (

          <div className="flex flex-col items-center gap-2 rounded-2xl bg-linear-to-b from-white/5 to-white/2.5 px-3 py-4">

            <div className="relative h-9 w-9">
              <Image
                src="/icon.svg"
                alt="ETM SAC"
                fill
                priority
                draggable={false}
                className="select-none object-contain"
              />
            </div>

            <button
              onClick={toggleCollapsed}
              title="Expandir"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 hover:bg-white/5 hover:text-white"
            >
              <PanelLeftClose size={15} className="rotate-180" />
            </button>

          </div>

        ) : (

          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-linear-to-b from-white/5 to-white/2.5 px-4">

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
              <h1 className="whitespace-nowrap text-[12px] font-semibold tracking-[0.16em] text-white/90">
                COMPANY S.A.C.
              </h1>
              <p className="mt-0.5 whitespace-nowrap text-[10px] tracking-[0.12em] text-neutral-500">
                ERP INDUSTRIAL
              </p>
            </div>

            <div className="absolute right-3 top-3 flex items-center gap-1">

              <button
                onClick={toggleCollapsed}
                title="Comprimir"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              >
                <PanelLeftClose size={15} />
              </button>

              <button
                onClick={toggleClosed}
                title="Ocultar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              >
                <X size={15} />
              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  )

}