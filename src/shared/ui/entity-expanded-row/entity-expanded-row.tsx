"use client"

import type {
  PropsWithChildren,
} from "react"

type Props=
  PropsWithChildren<{
    rowId:string
  }>

export function EntityExpandedRow({
  rowId,
  children,
}:Props){

  return(

    <div
      className="m-2 mb-3 rounded-xl bg-[#0D0D10] p-3"
    >

      {children}

    </div>

  )

}