"use client"

import type {
  PropsWithChildren,
} from "react"

export function TableScrollContainer({
  children,
}:PropsWithChildren){

  return(

    <div className="erp-scrollbar flex-1 overflow-x-auto overflow-y-hidden">

      <div className="flex h-full w-fit min-w-full flex-col">

        {children}

      </div>

    </div>

  )

}