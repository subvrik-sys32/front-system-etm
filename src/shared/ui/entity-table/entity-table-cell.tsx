"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"

type Props = {
  children: ReactNode
  align?: "left" | "center" | "right"
}

export function EntityTableCell({
  children,
  align="left",
}: Props){

  return(

    <div
      className={cn(
        "min-w-0 px-2.5 py-2.5 text-xs font-medium text-neutral-200",
        align==="left" && "text-left",
        align==="center" && "text-center",
        align==="right" && "text-right"
      )}
    >

      <div className="min-w-0">

        {children}

      </div>

    </div>

  )

}