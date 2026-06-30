"use client"

import type{
  PropsWithChildren,
}from"react"

import{
  cn,
}from"@/shared/utils/utils"

type Props=
  PropsWithChildren<{
    id:string
    disabled?:boolean
    templateColumns:string
    className?:string
  }>

export function EntitySortableRow({
  templateColumns,
  className,
  children,
}:Props){

  return(

    <div
      style={{
        gridTemplateColumns:templateColumns,
      }}
      className={cn(
        "grid min-w-0 items-center border-b border-white/5",
        className,
      )}
    >

      {children}

    </div>

  )

}