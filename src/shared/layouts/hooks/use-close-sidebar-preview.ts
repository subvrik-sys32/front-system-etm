"use client"

import { useEffect } from "react"

import { useSidebarStore } from "@/shared/stores/sidebar-store"

export function useCloseSidebarPreview(
  open:boolean,
){

  const mode=
    useSidebarStore(
      s=>s.mode,
    )

  const close=
    useSidebarStore(
      s=>s.close,
    )

  useEffect(()=>{

    if(
      open&&
      mode==="preview"
    ){

      close()

    }

  },[
    open,
    mode,
    close,
  ])

}